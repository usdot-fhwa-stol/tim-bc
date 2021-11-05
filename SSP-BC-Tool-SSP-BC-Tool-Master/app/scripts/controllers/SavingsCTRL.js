/* globals define */

define([
	'underscore',
	'text!resource/travelDelayCar.json',
	'text!resource/travelDelayTruck.json',
	'text!resource/fuelConsumptionNew.json',
	'text!resource/fuelPrices.json',
	'text!resource/wageByState.json',
	'text!resource/wageByRegion.json',
	'utilities/interpolation'
	], function( _, travelDelayCar, travelDelayTruck, fuelConsumption, fuelPrices, wageByState, wageByRegion, Interpolation ) {

	var SavingsCTRL = function() {

		// travel delay parsed JSON object
		this.travelDelayCar = JSON.parse( travelDelayCar );
		this.travelDelayTruck = JSON.parse( travelDelayTruck );
		this.fuelConsumption = JSON.parse( fuelConsumption );
		this.fuelPrices = JSON.parse( fuelPrices );
		this.wageByState = JSON.parse( wageByState );
		this.wageByRegion = JSON.parse( wageByRegion );
		this.interpolation = new Interpolation();

		// returns an impact value based on given curvature
		this.getCurvatureImpact = function( curvature ) {
			if( curvature == 'Sharp Curves') {
				return 10;
			} else if( curvature == 'Mild Curves') {
				return 5;
			} else {
				return 0;
			}
		};

		// Returns a value based on a give terrain type
		this.getGeneralTerrainImpact = function( generalTerrain ) {
			if( generalTerrain === 'Mountainous' ) {
				return 10;
			} else if( generalTerrain == 'Rolling Hills') {
				return 5;
			} else if( generalTerrain == 'Level') {
				return 2;
			} else {
				return 0;
			}
		};

		// object literal that retuns a value, which is a
		// percentage, based on a weather value
		this.weatherImpact = {
			'Clear': function() {
				return 0;
			},
			'Light Rain': function() {
				return .05;
			},
			'Wind': function() {
				return .05;
			},
			'Heavy Rain': function() {
				return .10;
			},
			'Light Snow': function() {
				return .10;
			},
			'Low Visibility': function() {
				return .10;
			},
			'Fog': function() {
				return .15;
			},
			'Heavy Snow': function() {
				return .35;
			},
			'Icy Conditions': function() {
				return .40;
			},
		};

		// this builds a "weather object" that returns an object
		// with a name, percentage, and impact
		this.buildWeatherObject = function( segment ) {
			var _this = this;
			var prefixes = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'];
			var weather = [];
			var weatherError = 0;

			_.each( prefixes, function( prefix ){
				if( segment.get( prefix + 'WeatherState') === 'visible' ) {
					if( segment.get( prefix + 'Weather') === 'Select Type') {
						weatherError++;
					} else {
						weather.push({
							name: segment.get( prefix + 'Weather'),
							percentage: segment.get( prefix + 'WeatherPrcnt'),
							impact: _this.weatherImpact[segment.get( prefix + 'Weather')]() * segment.get('mainLaneSpeedLimit')
						});
					}
				}
			});

			if( weatherError > 0 ) {
				$('.invalid-weather-type').removeClass('hidden');
			} else {
				$('.invalid-weather-type').addClass('hidden');
			}

			return weather;
		};

		// object literal that returns a number that
		// represents a lane blockage
		this.getBlockageNum = {
			'shoulderBlockage': function() {
				return 0;
			},
			'oneLaneBlockage': function() {
				return 1;
			},
			'twoLaneBlockage': function() {
				return 2;
			},
			'threeLaneBlockage': function() {
				return 3;
			},
			'fourLaneBlockage': function() {
				return 4;
			},
			'fiveLaneBlockage': function() {
				return 5;
			},
			'sixLaneBlockage': function() {
				return 6;
			}
		};

		this.getIncidentsByWeather = function( objPeak ) {
			var incidentsByWeather = [];
			var hzCurvatureImpact, rampsImpact, weatherImpact;
			var _this = this;
			
			objPeak = Object.getPrototypeOf( objPeak );

			_.each( objPeak.blockages, function( blockage ) {
				_.each( objPeak.weather, function( weather ) {

					generalTerrainImpact = _this.getGeneralTerrainImpact( objPeak.generalTerrain );
					hzCurvatureImpact = _this.getCurvatureImpact( objPeak.horizontalCurvature );
					rampsImpact = _this.getRampsPerMileImpact( objPeak.rampsPerMile );
					weatherImpact = weather.impact;

					incidentsByWeather.push({
						peak: objPeak.name,
						weather: weather.name,
						blockage: blockage.name,
						blockageNum: _this.getBlockageNum[blockage.name](),
						blockageSavings: blockage.savings,
						incidents: ( weather.percentage / 100 ) * blockage.numManagedIncidents,
						hzCurvatureImpact: hzCurvatureImpact,
						numberOfLanes: objPeak.numberOfLanes,
						rampsImpact: rampsImpact,
						weatherImpact: weatherImpact,
						effectiveSpeed: _this.getSpeedAVG( _this.getEffectiveSpeed( objPeak.speedLimit, hzCurvatureImpact, rampsImpact, weatherImpact ), objPeak.segmentName ),
						avgIncidentDuration: blockage.avgIncidentDuration,
						avgIncidentDurationWithSavings: blockage.avgIncidentDurationWithSavings,
						trafficVolume: _this.getRoundedTrafficVolume( objPeak.trafficVolume )
					});

				});
			});

			return incidentsByWeather;
		};

		// get the upper average based on a given array
		this.getUpper = function( array, value ) {
			if( value < array[0] ) {
				return array[0];
			} else {
				for( var i = 0, len = array.length; i < len; i++ ) {
					if( value == array[i] ) {
						return value;
					} else if( array[i] < value && array[i+1] > value ) {
						return array[i+1];
					}
				}
			}
		};

		// get the lower average based on a given array
		this.getLower = function( array, value ) {
			if( value < array[0] ) {
				return array[0];
			} else {
				for( var i = 0, len = array.length; i < len; i++ ) {
					if( value == array[i] ) {
						return value;
					} else if( array[i] < value && array[i+1] > value ) {
						return array[i];
					}
				}
			}
		};

		// returns the rounded result based on an array
		// of categories given
		this.roundArray = function( array, value) {
			for( var i = 0, len = array.length; i < len; i++ ) {
				if( value === array[i] ) {
					return value;
				} else if( array[i] < value && array[i+1] > value ) {
					var lower = array[i];
					var upper = array[i+1];
					var lowResult = value - lower;
					var uppResult = upper - value;
					if( uppResult <= lowResult ) {
						return upper;
					} else {
						return lower;
					} 
				}
			}

		};

		// get the speed average upper and lower categories
		// @param speed = this is the mainline speed given by the user
		this.getSpeedAVG = function( speed, segmentName ) {
			var _this = this;
			var speeds = [60,70,80,90,100,120];
			speed = speed / 0.621371192237;

			// Trigger invalid speed to alert user
			if( speed < 60 || speed > 120 ) {
				//Deleted by Fang Zhou for deleting speed range error message on 09/11/2015
				//GlobalEvent.trigger('errorSpeed', { name: segmentName });
				//Deleted end for deleting speed range error message on 09/11/2015
			}

			return {
				value: speed,
				upper: _this.getUpper(speeds, speed),
				lower: _this.getLower(speeds, speed)
			}
		}

		// get the rounded traffic volume
		// @param trafficVolume  = get a traffic volume divided by the
		// number of lanes
		this.getRoundedTrafficVolume = function( trafficVolume ) {
			var _this = this;
			var volumes = [500,1000,1200,1400,1600,1800,2000,2200];
			var RTV = _this.roundArray( volumes, trafficVolume );
			return RTV;
		};

		// get the incident duration object with the SSP Savings
		// @param avgIncidentDuration = value taken from Incident Duration
		// for each Blockage for each Peak.
		this.incidentDurationAVG = function( avgIncidentDuration ) {
			var _this = this;
			var ID = [1,300,600,900,1200,1500,1800,2100,2400,2700,3000,3300,3600,3900,4200,4500,4800,5100,5400,5700,6000,6300,6600,6900,7200,9000,10800,12600,14400];
			return {
				value: avgIncidentDuration * 60,
				upper: _this.getUpper( ID, avgIncidentDuration * 60 ),
				lower: _this.getLower( ID, avgIncidentDuration * 60 )
			}
		};

		// get the incident duration object with the SSP Savings
		// @param avgIncidentDuration = value taken from Incident Duration
		// for each Blockage for each Peak.
		// @param minutesSavings = the value take from the Incident Duration
		// savings for each blockage.
		this.incidentDurationWithSavingsAVG = function( avgIncidentDuration, minutesSavings ) {
			var _this = this;
			var ID = [1,300,600,900,1200,1500,1800,2100,2400,2700,3000,3300,3600,3900,4200,4500,4800,5100,5400,5700,6000,6300,6600,6900,7200,9000,10800,12600,14400];

			avgIncidentDuration = avgIncidentDuration - minutesSavings;
			
			return {
				value: avgIncidentDuration * 60,
				upper: _this.getUpper( ID, avgIncidentDuration * 60 ),
				lower: _this.getLower( ID, avgIncidentDuration * 60 )
			}
		};

		this.getCarDelay = function ( options ) {

			options = options || {};

			_.each( travelDelayCar, function( TDC, index ) {					
				if( TDC['duration'] == options.duration && TDC['speed'] == options.speed && TDC['volume'] == options.volume ) {
					var index = options.lanes + '_' + options.blockage;
					return TDC[index];
				}
			});

			return 0;

		};

		this.getRampsPerMile = function( ramps, miles ) {
			return ramps / miles;
		};

		this.getRampsPerMileImpact = function( rampsPerMile ) {
			var RPM = Number( rampsPerMile );
			return RPM * 2.5;
			// 0 - 1.999
			// if( RPM < 2 ) {
			// 	return 0;
			// } else
			// // 2 - 3.999
			// if( RPM >= 2 && RPM < 4 ) {
			// 	return 5;
			// } else
			// // 4 - 5.999
			// if( RPM >= 4 && RPM < 6 ) {
			// 	return 10;
			// } 
			// // 6 and above
			// else {
			// 	return 15;
			// }
		};

		// Returns the speed minus the maximum impact speed reduction
		// @param speed = the miles per hour user input
		// @param hzCurvatureImpact = the impact caused by horizontal curvature
		// @param RPMImpact = the impact caused by the number of ramps per mile
		// @param weatherImpact = the impact cause by the weather type
		this.getEffectiveSpeed = function( speed, hzCurvatureImpact, RPMImpact, weatherImpact ) {
			var impact = Math.max( hzCurvatureImpact, RPMImpact, weatherImpact );
			var effectiveSpeed = speed - impact;
			return effectiveSpeed;
		};

		// Returns a total of the car and truck travel delay based on the
		// truck percentage e.g. if 10% are trucks then 90% are cars
		// @param meta = the incidents by weather object we created
		// @param truckPercentage = the percentage of trucks given by the user
		this.getTotalTravelDelay = function( meta, truckPercentage, withSavings ) {
			var totalTravelDelay = 0;

			if( withSavings ) {
				var travelDelayCar = meta.travelDelayCarWithSavings,
					travelDelayTruck = meta.travelDelayTruckWithSavings;
			} else {
				var travelDelayCar = meta.travelDelayCar,
						travelDelayTruck = meta.travelDelayTruck;
			}

			var totalTravelDelayCar = travelDelayCar * ((100 - truckPercentage) / 100);
			var totalTravelDelayTruck = travelDelayTruck * ( truckPercentage / 100);

			totalTravelDelay = totalTravelDelayCar + totalTravelDelayTruck;

			return totalTravelDelay;
		};

		// The functions that builds a Peak Object for a given operation time
		// @param segment = represents 1 segment with user inputs
		// @param strPeak = a String containing the name of a peak e.g. 'amPeak'
		this.buildPeak = function( segment, strPeak ) {
			var _this = this;
			var objPeak = {};
			// Check if a peak is active by checking its visibility
			if( segment.get( strPeak + 'Visibility' ) === 'visible' ) {
				// Create a "peak" object
				objPeak = {
					name: strPeak,
					trafficVolume: segment.get( strPeak + 'TrafficVolume'),
					truckPercentage: segment.get( strPeak + 'TruckPercentage'),
					rampsPerMile: segment.get('numberOfRamps') / segment.get('segmentLength'),
					generalTerrain: segment.get('generalTerrain'),
					horizontalCurvature: segment.get('horizontalCurvature'),
					speedLimit: segment.get('mainLaneSpeedLimit'),
					numberOfLanes: segment.get('numberOfTrafficLanesByDirection'),
					region: segment.get('region'),
					segmentName: segment.get('name')
				};
				// Keep the actual traffic volume of the peak
				objPeak.peakTrafficVolume = objPeak.trafficVolume;
				// Divide traffic volume by number of lanes by direction
				objPeak.trafficVolume = objPeak.trafficVolume / objPeak.numberOfLanes;
				// Check if rampsPerMile is Infinity
				objPeak.rampsPerMile = (objPeak.rampsPerMile == Infinity) ? 0 : objPeak.rampsPerMile;
				// Create blockages array which contains each blockage
				var blockages = [];
				// Determine the number of blockages by the number of lanes
				// by direction and build blockage objects for each of them
				if( segment.get('averageDurationActive') == 'active') {
					var avgDurationSavings = segment.get('averageDurationSavings');
					// Switch case if the Average Duration is 'active'
					switch( segment.get('numberOfTrafficLanesByDirection') ) {
						case 5:
						case 6:
							blockages.push({
								name: 'fourLaneBlockage',							
								savings: Number( avgDurationSavings ),
								avgIncidentDuration: _this.incidentDurationAVG( segment.get( strPeak + 'FourLaneBlockageAVGID') ),
								avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'FourLaneBlockageAVGID') + Number( avgDurationSavings ) ),
								numManagedIncidents: Number( segment.get( strPeak + 'FourLaneBlockageManIndt') )
							});
						case 4:
							blockages.push({
								name: 'threeLaneBlockage',							
								savings: Number( avgDurationSavings ),
								avgIncidentDuration:  _this.incidentDurationAVG( segment.get( strPeak + 'ThreeLaneBlockageAVGID') ),
								avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'ThreeLaneBlockageAVGID') + Number( avgDurationSavings ) ),
								numManagedIncidents: Number( segment.get( strPeak + 'ThreeLaneBlockageManIndt') )
							});
						case 3:
							blockages.push({
								name: 'twoLaneBlockage',							
								savings: Number( avgDurationSavings ),
								avgIncidentDuration:  _this.incidentDurationAVG( segment.get( strPeak + 'TwoLaneBlockageAVGID') ),
								avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'TwoLaneBlockageAVGID') + Number( avgDurationSavings ) ),
								numManagedIncidents: Number( segment.get( strPeak + 'TwoLaneBlockageManIndt') )
							});
						default:
							blockages.push({
								name: 'oneLaneBlockage',							
								savings: Number( avgDurationSavings ),
								avgIncidentDuration:  _this.incidentDurationAVG( segment.get( strPeak + 'OneLaneBlockageAVGID') ),
								avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'OneLaneBlockageAVGID') + Number( avgDurationSavings ) ),
								numManagedIncidents: Number( segment.get( strPeak + 'OneLaneBlockageManIndt') )
							});
							blockages.push({
								name: 'shoulderBlockage',							
								savings: Number( avgDurationSavings ),
								avgIncidentDuration:  _this.incidentDurationAVG( segment.get( strPeak + 'ShoulderBlockageAVGID') ),
								avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'ShoulderBlockageAVGID') + Number( avgDurationSavings ) ),
								numManagedIncidents: Number( segment.get( strPeak + 'ShoulderBlockageManIndt') )
							});
						break;
					}//- switch
				} else {
					// Switch case if the Average Duration Savings is not 'active'
					switch( segment.get('numberOfTrafficLanesByDirection') ) {
						case 5:
						case 6:
							blockages.push({
								name: 'fourLaneBlockage',							
								savings: Number( segment.get('fourLaneBlockageSavings') ),
								avgIncidentDuration: _this.incidentDurationAVG( segment.get( strPeak + 'FourLaneBlockageAVGID') ),
								avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'FourLaneBlockageAVGID') + Number( segment.get('fourLaneBlockageSavings') ) ),
								numManagedIncidents: Number( segment.get( strPeak + 'FourLaneBlockageManIndt') )
							});
						case 4:
							blockages.push({
								name: 'threeLaneBlockage',							
								savings: Number( segment.get('threeLaneBlockageSavings') ),
								avgIncidentDuration:  _this.incidentDurationAVG( segment.get( strPeak + 'ThreeLaneBlockageAVGID') ),
								avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'ThreeLaneBlockageAVGID') + Number( segment.get('threeLaneBlockageSavings') ) ),
								numManagedIncidents: Number( segment.get( strPeak + 'ThreeLaneBlockageManIndt') )
							});
						case 3:
							blockages.push({
								name: 'twoLaneBlockage',							
								savings: Number( segment.get('twoLaneBlockageSavings') ),
								avgIncidentDuration:  _this.incidentDurationAVG( segment.get( strPeak + 'TwoLaneBlockageAVGID') ),
								avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'TwoLaneBlockageAVGID') + Number( segment.get('twoLaneBlockageSavings') ) ),
								numManagedIncidents: Number( segment.get( strPeak + 'TwoLaneBlockageManIndt') )
							});
						default:
							blockages.push({
								name: 'oneLaneBlockage',							
								savings: Number( segment.get('oneLaneBlockageSavings') ),
								avgIncidentDuration:  _this.incidentDurationAVG( segment.get( strPeak + 'OneLaneBlockageAVGID') ),
								avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'OneLaneBlockageAVGID') + Number( segment.get('oneLaneBlockageSavings') ) ),
								numManagedIncidents: Number( segment.get( strPeak + 'OneLaneBlockageManIndt') )
							});
							blockages.push({
								name: 'shoulderBlockage',							
								savings: Number( segment.get('shoulderBlockageSavings') ),
								avgIncidentDuration:  _this.incidentDurationAVG( segment.get( strPeak + 'ShoulderBlockageAVGID') ),
								avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'ShoulderBlockageAVGID') + Number( segment.get('shoulderBlockageSavings') ) ),
								numManagedIncidents: Number( segment.get( strPeak + 'ShoulderBlockageManIndt') )
							});
						break;
					}//- switch
				}
				// Add blockages to the peak object
				objPeak.blockages = blockages;
			}
			// return the peak object
			return objPeak;
		};

		// Begins the process of the calculations.
		// Builds Peak Objects for each active operation time based on user input.
		// @param segment = represents 1 segment with user inputs
		this.calculateDelaySavings = function( segment, projectState ) {
			var _this = this;
			// build peak object
			var peaks = ['amPeak', 'pmPeak', 'weekdayOffPeak', 'weekend'];
			var objPeaks = [];
			var tmpPeak = {};
			// Create an array of peaks that are active or visible
			_.each(peaks, function( peak ) {
				// Build peak object
				tmpPeak = Object.create( _this.buildPeak( segment, peak ) );
				// Check if peak object was built and add it to peaks array
				// otherwise skip it ensuring we only have active peak objects
				if( tmpPeak.name !== undefined ) {
					objPeaks.push( tmpPeak );
				}
			});
			// For each peak object get other properties needed for calculations
			var peakz = {};
      _.each(	objPeaks, function( peak ) {
      	peakz = Object.getPrototypeOf( peak );
      	// Get the rounded traffic volume for this peak
        peakz.roundedTrafficVolume = _this.getRoundedTrafficVolume( peakz.trafficVolume );
        // Build a separate weather object to make calculations
        // a lot easier to understand and debug
        peakz.weather = _this.buildWeatherObject( segment );
        // Get the number of incidents for each weather defined by the user
        peakz.incidentsByWeather = _this.getIncidentsByWeather( peak );
        // Get the Value of Secondary Incidents Prevented
        //peakz.secondarySavings = ;
        Object.defineProperty( peak, 'prototype', peakz);
      });
      // Get the travel delays for each peak's incident by weather
      var carPercentage = 0;
      var truckPercentage = 0;
      var fuelCost = _this.fuelPrices[projectState];
			_.each( objPeaks, function( peak ) {
				peak = Object.getPrototypeOf(peak);
				_.each( peak.incidentsByWeather, function( meta ) {
					// Compute the percentage of incidents for cars and trucks
					carPercentage = (100 - peak.truckPercentage) / 100;
					truckPercentage = peak.truckPercentage / 100;
					// Get travel delays without savings for 1 incident
					meta.travelDelayCar 	= _this.getTravelDelayCar( meta, peak.truckPercentage, peak.peakTrafficVolume, segment.get('generalTerrain') ) * meta.incidents;
					meta.travelDelayTruck = _this.getTravelDelayTruck( meta, peak.truckPercentage, peak.peakTrafficVolume, segment.get('generalTerrain') ) * meta.incidents;
					// Get travel delays with the incident duration savings given by user
					meta.travelDelayCarWithoutSSP 	= _this.getTravelDelayCar( meta, peak.truckPercentage, peak.peakTrafficVolume, segment.get('generalTerrain'), true ) * meta.incidents;
					meta.travelDelayTruckWithoutSSP = _this.getTravelDelayTruck( meta, peak.truckPercentage, peak.peakTrafficVolume, segment.get('generalTerrain'), true ) * meta.incidents;
					// Total travel delay for an incident
					meta.totalTravelDelayCarAndTruck = meta.travelDelayCar + meta.travelDelayTruck;
					meta.totalTravelDelayCarAndTruckWithoutSSP = meta.travelDelayCarWithoutSSP + meta.travelDelayTruckWithoutSSP;
					// Calculate Savings for Car, Truck, and the total savings for both
					meta.travelDelayCarSavings = meta.travelDelayCarWithoutSSP - meta.travelDelayCar;
					meta.travelDelayTruckSavings = meta.travelDelayTruckWithoutSSP - meta.travelDelayTruck;
					meta.travelDelaySavings = meta.totalTravelDelayCarAndTruckWithoutSSP - meta.totalTravelDelayCarAndTruck;
					/***
						Calculate fuel consumption
						***/
					meta.fuelConsumptionGrams = _this.getFuelConsumption( meta, peak.peakTrafficVolume );
					meta.fuelConsumptionWithoutSSPGrams = _this.getFuelConsumption( meta, peak.peakTrafficVolume, true );
					// Calculate fuel consumption correction
					meta.fuelConsumptionCorrection = _this.getFuelConsumptionCorrection( truckPercentage, segment.get('generalTerrain') ) * 907185;

					// Actual Fuel Consumption - USE FOR SAVINGS CALCULATIONS
					meta.fuelConsumptionTotal = meta.fuelConsumptionGrams + meta.fuelConsumptionCorrection;
					meta.fuelConsumptionTotalGallons = meta.fuelConsumptionTotal / 2834.95 * meta.incidents;
					meta.fuelConsumptionTotalWithoutSSP = meta.fuelConsumptionWithoutSSPGrams + meta.fuelConsumptionCorrection;
					meta.fuelConsumptionTotalWithoutSSPGallons = meta.fuelConsumptionTotalWithoutSSP / 2834.95 * meta.incidents;
					// Calculate the fuel savings in gallon
					meta.fuelSavingsGallons = meta.fuelConsumptionTotalWithoutSSPGallons - meta.fuelConsumptionTotalGallons;
					// Monetize the fuel savings in gallon
					meta.fuelSavings = meta.fuelSavingsGallons * fuelCost;

					// Compute for with and without SSP with corrections:
					meta.COEmission = 20.9 * 22.1 * meta.fuelConsumptionTotalGallons;
					meta.CO2Emission = 451 * 22.1 * meta.fuelConsumptionTotalGallons;
					meta.HCEmission = 2.8 * 22.1 * meta.fuelConsumptionTotalGallons;
					meta.NOxEmission = 1.39 * 22.1 * meta.fuelConsumptionTotalGallons;
					meta.SOxEmission = 2 * (80 / 1000000) * meta.fuelConsumptionTotalGallons;
					
					meta.COEmissionWithoutSSP = 20.9 * 22.1 * meta.fuelConsumptionTotalWithoutSSPGallons;
					meta.CO2EmissionWithoutSSP = 451 * 22.1 * meta.fuelConsumptionTotalWithoutSSPGallons;
					meta.HCEmissionWithoutSSP = 2.8 * 22.1 * meta.fuelConsumptionTotalWithoutSSPGallons;
					meta.NOxEmissionWithoutSSP = 1.39 * 22.1 * meta.fuelConsumptionTotalWithoutSSPGallons;
					meta.SOxEmissionWithoutSSP = 2 * (80 / 1000000) * meta.fuelConsumptionTotalWithoutSSPGallons;
					// Calculate emission savings
					meta.COEmissionSavings = (meta.COEmissionWithoutSSP - meta.COEmission) / 1000000;
					meta.CO2EmissionSavings = (meta.CO2EmissionWithoutSSP - meta.CO2Emission) / 1000000;
					meta.HCEmissionSavings = (meta.HCEmissionWithoutSSP - meta.HCEmission) / 1000000;
					meta.NOxEmissionSavings = (meta.NOxEmissionWithoutSSP - meta.NOxEmission) / 1000000;
					meta.SOxEmissionSavings = (meta.SOxEmissionWithoutSSP - meta.SOxEmission);

					meta.secondaryIncidents = segment.get('secondaryIncidentsPercentage') / 100 * meta.incidents;
					// meta.secondaryIncidentsWithoutSSP =  meta.secondaryIncidents * meta.totalTravelDelayCarAndTruckWithoutSSP  / meta.totalTravelDelayCarAndTruck;
					// if( ! meta.secondaryIncidentsWithoutSSP > 0 ) {
					// 	meta.secondaryIncidentsWithoutSSP = 0;
					// }
				});

			});

			_this.calculateTotalPeakSavings( objPeaks );

			return objPeaks;

		};

		this.calculateTotalPeakSavings = function( arrPeaks ) {
			var _this = this;

			_.each( arrPeaks, function( peak ) {
				peak = Object.getPrototypeOf( peak );

				var totalPeakTravelDelaySavings = 0;
				var totalPeakTravelDelayCarSavings = 0;
				var totalPeakTravelDelayTruckSavings = 0;
				var totalFuelConsumptionGallons = 0;
				var totalFuelSavings = 0;
				var totalFuelSavingsGallons = 0;
				// New total travel delays
				var totalTravelDelay = 0;
				var	totalTravelDelayWithoutSSP = 0;

				_.each( peak.incidentsByWeather, function( meta ) {
					totalPeakTravelDelaySavings += meta.travelDelaySavings;
					totalPeakTravelDelayCarSavings += meta.travelDelayCarSavings;
					totalPeakTravelDelayTruckSavings += meta.travelDelayTruckSavings;
					// Fuel Consumption
					totalFuelConsumptionGallons += meta.fuelConsumptionTotalGallons;
					totalFuelSavings += meta.fuelSavings;
					totalFuelSavingsGallons += meta.fuelSavingsGallons;
					// these are for secondary incidents
					totalTravelDelay += meta.totalTravelDelayCarAndTruck;
					totalTravelDelayWithoutSSP += meta.totalTravelDelayCarAndTruckWithoutSSP;
				});


				peak.totalSegmentEmissions = _this.calculateTotalEmissions( peak.incidentsByWeather );

				peak.totalFuelConsumptionGallons = totalFuelConsumptionGallons;
				peak.totalFuelSavings = totalFuelSavings;
				peak.totalFuelSavingsGallons = totalFuelSavingsGallons;
				
				peak.totalPeakSavings = {
					totalPeakTravelDelaySavings: totalPeakTravelDelaySavings,
					totalPeakTravelDelayCarSavings: totalPeakTravelDelayCarSavings,
					totalPeakTravelDelayTruckSavings: totalPeakTravelDelayTruckSavings,
					totalTravelDelay: totalTravelDelay,
					totalTravelDelayWithoutSSP: totalTravelDelayWithoutSSP
				};
			});

			this.calculateSecondaryIncidentsWithoutSSP( arrPeaks );

			return arrPeaks;

		};

		this.calculateSecondaryIncidentsWithoutSSP = function( arrPeaks ) {
			var allTDWithoutSSP = 0,
					allTDWithSSP = 0;
			// Get the total travel delay from the sum of car + truck
			// travel delay for with and without SSP
			_.each( arrPeaks, function( peak ) {
				peak = Object.getPrototypeOf( peak );
				allTDWithSSP += peak.totalPeakSavings.totalTravelDelay;
				allTDWithoutSSP += peak.totalPeakSavings.totalTravelDelayWithoutSSP;
			});


			_.each( arrPeaks, function( peak ) {
				var totalSecondaryIncidents = 0;
				peak = Object.getPrototypeOf( peak );
				_.each( peak.incidentsByWeather, function( meta ) {
					// Calculate Secondary Incidents Without SSP using this formula:
					// x = a * b / c; where a = Secondary Incidents With SSP;
					// b = all TD Without SSP; c = all TD With SSP;
					meta.secondaryIncidentsWithoutSSP =  meta.secondaryIncidents * allTDWithoutSSP  / allTDWithSSP;
					// Check for NaN or Infinity
					if( ! meta.secondaryIncidentsWithoutSSP > 0 ) {
						meta.secondaryIncidentsWithoutSSP = 0;
					}
					totalSecondaryIncidents += meta.secondaryIncidentsWithoutSSP - meta.secondaryIncidents;
				});
				peak.totalPeakSavings.totalSecondaryIncidents = totalSecondaryIncidents;
			});

			return arrPeaks;

		};

		// This searches within a given table, which is a JSON object
		// and returns a value depending on the given parameters
		// @param delayTable = JSON object containing travel delays
		// @param speed = an integer value in kilometers
		// @param duration = an integer value in seconds
		// @param volume = an integer value of the volume of traffic
		// @param lane = number of lanes by direction
		// @param blockage = a number representing a blockage e.g. 0 means Shoulder Blockage
		this.getValueFromTable = function( delayTable, speed, duration, volume, lane, blockage ) {
			var delay;
			_.each( delayTable, function( item ) {
				if( item['speed'] == speed && item['duration'] == duration && item['volume'] == volume ) {
					delay = item;
				}
			});
			return delay[lane + '_' + blockage];
		};

		this.getValueFromTableNew = function( delayTable, duration, speed, volume, lane, blockage ) {
			var delay;
			_.each( delayTable, function( item ) {
				if( item['speed'] == speed && item['duration'] == duration && item['volume'] == volume ) {
					delay = item;
				}
			});
			return delay[lane + '_' + blockage];
		};

		// Return fuel consumption based on given values and Fuel Consumptio Table
		// @param meta = Incident By Weather object
		// @param truckPercentage = Exact value entered by user e.g. 6 or 10, and not .06 or .1
		// @param
		this.getFuelConsumption = function( meta, trafficVolume, withSavings ) {
			// Assure scope of this
			var _this = this;
			// Designate table to be used
			var table = _this.fuelConsumption;
			// Get basic requirements
			var _duration = ( withSavings ) ? meta.avgIncidentDurationWithSavings.value : meta.avgIncidentDuration.value,
					_speed 		= meta.effectiveSpeed.value,
					_volume 	= trafficVolume;
			// Return 0 if duration is 0, exit early
			if( _duration == 0 ) { return _duration; }
			// Other values for correction, separated to reduce confusion
			var numberOfLanes = meta.numberOfLanes,
					blockageNum 	= meta.blockageNum;
			// Begin usage of interpolation class by giving values
			_this.interpolation.setValues( _duration, _speed, _volume );
			var _weights = _this.interpolation.calculateWeights();

			var dU = _this.interpolation.getUpper('duration');
			var sU = _this.interpolation.getUpper('speed');
			var vU = _this.interpolation.getUpper('volume');
			var dL = _this.interpolation.getLower('duration');
			var sL = _this.interpolation.getLower('speed');
			var vL = _this.interpolation.getLower('volume');

			var dUsUvU = _this.getValueFromTableNew( table, dU, sU, vU, numberOfLanes, blockageNum );
			var dUsUvL = _this.getValueFromTableNew( table, dU, sU, vL, numberOfLanes, blockageNum );
			var dLsUvL = _this.getValueFromTableNew( table, dL, sU, vL, numberOfLanes, blockageNum );
			var dLsUvU = _this.getValueFromTableNew( table, dL, sU, vU, numberOfLanes, blockageNum );

			var dLsLvL = _this.getValueFromTableNew( table, dL, sL, vL, numberOfLanes, blockageNum );
			var dLsLvU = _this.getValueFromTableNew( table, dL, sL, vU, numberOfLanes, blockageNum );
			var dUsLvU = _this.getValueFromTableNew( table, dU, sL, vU, numberOfLanes, blockageNum );
			var dUsLvL = _this.getValueFromTableNew( table, dU, sL, vL, numberOfLanes, blockageNum );

			if( dU == dL ) var durationDiff = 0;
			else var durationDiff = ( _duration - dL ) / ( dU - dL );

			if( sU == sL ) var speedDiff = 0;
			else var speedDiff = ( _speed - sL ) / ( sU - sL );

			if( vU == vL ) var volumeDiff = 0;
			else var volumeDiff = ( _volume - vL ) / ( vU - vL );

			//f00 = f(x0,y0,z0), f01 = f(x1,y0,z0), f10 = f(x0,y1,z0), f11 = f(x1,y1,z0)
			//f20 = f(x0,y0,z1), f21 = f(x1,y0,z1), f30 = f(x0,y1,z1), f31 = f(x1,y1,z1)

			var c00 = dLsLvL * ( 1 - durationDiff ) + dUsLvL * durationDiff;
			var c10 = dLsUvL * ( 1 - durationDiff ) + dUsUvL * durationDiff;
			var c01 = dLsLvU * ( 1 - durationDiff ) + dUsLvU * durationDiff;
			var c11 = dLsUvU * ( 1 - durationDiff ) + dUsUvU * durationDiff;

			var c0 = c00 * ( 1 - speedDiff) + c10 * speedDiff;
			var c1 = c01 * ( 1 - speedDiff) + c11 * speedDiff;

			return c0 * ( 1 - volumeDiff ) + c1 * volumeDiff;

		};

		this.getFuelConsumptionCorrection = function( truckPercentage, generalTerrain ) {
			var _this = this;
			var COMP = truckPercentage * 100;
			var GRADIENT = _this.getGeneralTerrainImpact( generalTerrain );

			var x = ( 0.001 * COMP ) - ( 0.015 * GRADIENT ) + ( 0.001 * ( GRADIENT * GRADIENT ) );

			return Math.pow(Math.E, x);
		};

		// Returns a travel delay based on a given object and table
		// @param meta = is a peak object
		// @param table = is a JSON object containing travel delays
		this.getTravelDelay = function( meta, truckPercentage, trafficVolume, generalTerrain, savings ) {
			var _this = this;
			var table = _this.fuelConsumption;
			// Checks if savings is given and then deduct it to the
			// incident duration
			if( savings === true ) {
				var incidentDuration = meta.avgIncidentDurationWithSavings;
			} else {
				var incidentDuration = meta.avgIncidentDuration;
			}

			var VOLUME = trafficVolume,
					COMP = truckPercentage,
					GRADIENT = _this.getGeneralTerrainImpact( generalTerrain );

			var speed = meta.effectiveSpeed;
			var trafficVolume = trafficVolume;
			var lane = meta.numberOfLanes;
			var blockage = meta.blockageNum;
			// for test check if undefined or give it default travel delay car
			// if( table === 'fuel') {
			// 	table =  _this.fuelConsumption;
			// } else if( table === 'car') {
			// 	table =  _this.travelDelayCar;
			// } else if( table === 'truck') {
			// 	table =  _this.travelDelayTruck;
			// } else {
			// 	return false;
			// }

			var TD, TDSU, TDSL, SUIUTD, SLILTD, SUILTD, SLIUTD;
			var errorCheck = 0;

			// This triggers when there's an upper and lower speed
			// but an incident duration without upper and lower
			if( incidentDuration.upper === incidentDuration.lower && speed.upper != speed.lower ) {
				SUIUTD = _this.getValueFromTable( table, speed.upper, incidentDuration.upper, trafficVolume, lane, blockage);
				SLIUTD = _this.getValueFromTable( table, speed.lower, incidentDuration.upper, trafficVolume, lane, blockage);
				if( SUIUTD != undefined && SLIUTD != undefined ) {
					TD = SLIUTD[lane+'_'+blockage] + ( ((speed.value - speed.lower) / (speed.upper - speed.lower)) * ( SUIUTD[lane+'_'+blockage] - SLIUTD[lane+'_'+blockage] ) );
				} else {
					errorCheck++
				}
			}
			// This triggers when there's an upper and lower incident
			// duration but an even speed
			if( incidentDuration.upper != incidentDuration.lower && speed.upper === speed.lower ) {
				SUIUTD = _this.getValueFromTable( table, speed.upper, incidentDuration.upper, trafficVolume, lane, blockage);
				SUILTD = _this.getValueFromTable( table, speed.upper, incidentDuration.lower, trafficVolume, lane, blockage);
				if( SUIUTD != undefined && SUILTD != undefined ) {
					TD = SUILTD[lane+'_'+blockage] + ( ((incidentDuration.value - incidentDuration.lower) / (incidentDuration.upper - incidentDuration.lower)) * ( SUIUTD[lane+'_'+blockage] - SUILTD[lane+'_'+blockage] ) );
				} else {
					errorCheck++
				}
			}
			// This triggers when there's an upper and lower incident
			// duration but an even speed
			if( incidentDuration.upper === incidentDuration.lower && speed.upper === speed.lower ) {
				TD = _this.getValueFromTable( table, speed.value, incidentDuration.value, trafficVolume, lane, blockage);
				if( TD != undefined ) {
					TD = TD[lane+'_'+blockage];
				} else {
					errorCheck++
				}
			}

			// both speed and incident duration has an upper and lower
			// category for each
			if( incidentDuration.upper != incidentDuration.lower && speed.upper != speed.lower ) {
				SUIUTD = _this.getValueFromTable( table, speed.upper, incidentDuration.upper, trafficVolume, lane, blockage);
				SUILTD = _this.getValueFromTable( table, speed.upper, incidentDuration.lower, trafficVolume, lane, blockage);
				SLIUTD = _this.getValueFromTable( table, speed.lower, incidentDuration.upper, trafficVolume, lane, blockage);
				SLILTD = _this.getValueFromTable( table, speed.lower, incidentDuration.lower, trafficVolume, lane, blockage);

				if( SUIUTD != undefined && SLIUTD != undefined && SUILTD != undefined && SLILTD != undefined ) {
					TDSU = SUILTD[lane+'_'+blockage] + ( ((incidentDuration.value - incidentDuration.lower) / (incidentDuration.upper - incidentDuration.lower)) * ( SUIUTD[lane+'_'+blockage] - SUILTD[lane+'_'+blockage] ) );
					TDSL = SLILTD[lane+'_'+blockage] + ( ((incidentDuration.value - incidentDuration.lower) / (incidentDuration.upper - incidentDuration.lower)) * ( SLIUTD[lane+'_'+blockage] - SLILTD[lane+'_'+blockage] ) );
				} else {
					errorCheck++
				}

				if( TDSL != undefined && TDSU != undefined ) {
					TD = TDSL + ( ((speed.value - speed.lower) / (speed.upper - speed.lower)) * ( TDSU - TDSL ) );
				} else {
					errorCheck++
				}
			}

			if( errorCheck > 0 ) {
				GlobalEvent.trigger('output:error');
			}

			var fuelCorrection = (0.001 * COMP) - (0.015 * GRADIENT) + (0.001 * (GRADIENT * GRADIENT));

			return TD + Math.pow( Math.E, fuelCorrection );

		};//-

		this.getTravelDelayCar = function( meta, truckPercentage, trafficVolume, generalTerrain, savings ) {
			var _this = this;
			// Set savings to false by default
			savings = savings || false;
			
			if( savings === true ) {
				var incidentDuration = meta.avgIncidentDurationWithSavings;
			} else {
				var incidentDuration = meta.avgIncidentDuration;
			}

			var FFS = meta.effectiveSpeed.value,
					VOLUME = trafficVolume / 1000,
					VOLUME2 = VOLUME * VOLUME,
					VOLUME3 = VOLUME2 * VOLUME,
					NUMBER_OF_LANES = meta.numberOfLanes,
					NUMBER_OF_BLOCKAGES = meta.blockageNum,
					NUMBER_OF_LANE_INDEX = (( NUMBER_OF_LANES - NUMBER_OF_BLOCKAGES ) / NUMBER_OF_LANES ) * 100,
					DURATION_HOUR = incidentDuration.value / 3600,
					COMP = truckPercentage,
					GRADIENT = _this.getGeneralTerrainImpact( generalTerrain );

			var TDc = -1.59 - (0.013 * NUMBER_OF_LANE_INDEX) + (0.55 * DURATION_HOUR) - (0.04 * (DURATION_HOUR * DURATION_HOUR)) + (0.01 * FFS ) + (0.02 * COMP) + (11.73 * VOLUME)- (5.04 * VOLUME2) + (0.71 * VOLUME3) + (0.15 * GRADIENT);

			return Math.pow(Math.E, TDc);

		};

		this.getTravelDelayTruck = function( meta, truckPercentage, trafficVolume, generalTerrain, savings ) {
			var _this = this;
			// Set savings to false by default
			savings = savings || false;
			
			if( savings === true ) {
				var incidentDuration = meta.avgIncidentDurationWithSavings;
			} else {
				var incidentDuration = meta.avgIncidentDuration;
			}

			var FFS = meta.effectiveSpeed.value,
					VOLUME = trafficVolume / 1000,
					VOLUME2 = VOLUME * VOLUME,
					VOLUME3 = VOLUME2 * VOLUME,
					NUMBER_OF_LANES = meta.numberOfLanes,
					NUMBER_OF_BLOCKAGES = meta.blockageNum,
					NUMBER_OF_LANE_INDEX = (( NUMBER_OF_LANES - NUMBER_OF_BLOCKAGES ) / NUMBER_OF_LANES ) * 100,
					DURATION_HOUR = incidentDuration.value / 3600,
					COMP = truckPercentage,
					SQR_COMP = Math.sqrt( COMP ),
					GRADIENT = _this.getGeneralTerrainImpact( generalTerrain );

			var TDtr = -4.3 - (0.01 * NUMBER_OF_LANE_INDEX) + (0.34 * DURATION_HOUR) + (0.01 * FFS ) + (0.94 * SQR_COMP) + (6.84 * VOLUME) - (3 * VOLUME2) + (0.47 * VOLUME3) + (0.49 * GRADIENT) - (0.03 * (GRADIENT * GRADIENT));

			return Math.pow(Math.E, TDtr);

		};

		this.getDriverWage = function( state, region ) {
			var _this = this;
			var wage = 0;

			if( region === 'Other' || region === 'Select Region' ) {
				wage = _this.wageByState[state];
			} else {
				wage = _this.wageByRegion[region];
			}

			return Number( wage );

		};
		//Added by Fang Zhou for adding Monetary conversion rates table on 09/14/2015
		this.getFuelCost = function( state ) {
			var _this = this;
			var fuelCost = 0;

			fuelCost = _this.fuelPrices[state];

			return Number( fuelCost );

		};
		//Added end for adding Monetary conversion rates table on 09/14/2015

		this.calculateTotalEmissions = function( incidentsByWeather ) {

			var segmentEmissions = {
				COEmission : 0,
				CO2Emission : 0,
				HCEmission : 0,
				NOxEmission : 0,
				SOxEmission : 0
			};

			_.each( incidentsByWeather, function( meta ) {
				segmentEmissions.COEmission += meta.COEmissionSavings;
				segmentEmissions.CO2Emission += meta.CO2EmissionSavings;
				segmentEmissions.HCEmission += meta.HCEmissionSavings;
				segmentEmissions.NOxEmission += meta.NOxEmissionSavings;
				segmentEmissions.SOxEmission += meta.SOxEmissionSavings;
			});

			return segmentEmissions;

		};

		// Return SavingsCTRL
		return this;
	};

	return SavingsCTRL;

});