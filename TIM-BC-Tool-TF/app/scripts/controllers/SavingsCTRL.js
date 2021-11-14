/* globals define */

'use strict';

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
				return 0.05;
			},
			'Wind': function() {
				return 0.05;
			},
			'Heavy Rain': function() {
				return 0.10;
			},
			'Light Snow': function() {
				return 0.10;
			},
			'Low Visibility': function() {
				return 0.10;
			},
			'Fog': function() {
				return 0.15;
			},
			'Heavy Snow': function() {
				return 0.35;
			},
			'Icy Conditions': function() {
				return 0.40;
			}
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
			'improvedShoulderBlockage': function() {
				return 0;
			},
			'oneLaneBlockage': function() {
				return 1;
			},
			'improvedOneLaneBlockage': function() {
				return 1;
			},
			'twoLaneBlockage': function() {
				return 2;
			},
			'improvedTwoLaneBlockage': function() {
				return 2;
			},
			'threeLaneBlockage': function() {
				return 3;
			},
			'improvedThreeLaneBlockage': function() {
				return 3;
			},
			'fourLaneBlockage': function() {
				return 4;
			},
			'improvedFourLaneBlockage': function() {
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
			var hzCurvatureImpact, rampsImpact, weatherImpact, generalTerrainImpact;
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

		this.getCompliance = function( segment, strPeak, lane, applySavings ) {
      // For Driver Removal Laws
      var proportion = Number( segment.get('proportion') ) / 100;
      var implementation = Number( segment.get('implementation') ) / 100;
      var averageImprovement = Number( segment.get('averageImprovement') );
			// Calculate Authority Removal Law Compliance.
			var laneIncidents = Number( segment.get(strPeak + lane + 'BlockageManIndt') );
			var laneDuration =  Number( segment.get(strPeak + lane + 'BlockageAVGID') );
			// calculate the proportion of drivers that complied with the DRL.
			var complianceRate = implementation * proportion;
      var compliantDrivers = complianceRate * laneIncidents;
      var nonCompliantDrivers = ( 1 - complianceRate ) * laneIncidents;
      // get improved duration, but in our case this means without the savings
      // i know it's confusing but just follow it
			var improvedLaneDuration = ( applySavings == true ) ? laneDuration + averageImprovement : laneDuration;

			return {
				compliantDrivers: compliantDrivers,
				nonCompliantDrivers: nonCompliantDrivers,
				laneDuration: laneDuration,
				laneIncidents: laneIncidents,
				improvedLaneDuration: improvedLaneDuration
				// increasedShoulderDuration: increasedShoulderDuration,
			}
		};

		// The functions that builds a Peak Object for a given operation time
		// @param object segment - represents the current segment we are 
		// working on.
		// @param string strPeak - contains the name of a peak e.g. 'amPeak'
		this.buildPeak = function( segment, strPeak, applySavings ) {
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
				// -------
				var avgDurationSavings = segment.get('averageDurationSavings');
				// Switch case if the Average Duration is 'active'
				switch( segment.get('numberOfTrafficLanesByDirection') ) {
					case 5:
					case 6:
						var tfFourLane = _this.getCompliance( segment, strPeak, 'FourLane', applySavings );
						blockages.push({
							name: 'fourLaneBlockage',							
							savings: Number( avgDurationSavings ),
							avgIncidentDuration:  _this.incidentDurationAVG( tfFourLane.laneDuration ),
							avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'FourLaneBlockageAVGID') + Number( avgDurationSavings ) ),
							numManagedIncidents: tfFourLane.nonCompliantDrivers
						});
						blockages.push({
							name: 'improvedFourLaneBlockage',							
							savings: Number( avgDurationSavings ),
							avgIncidentDuration:  _this.incidentDurationAVG( tfFourLane.improvedLaneDuration ),
							avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'improvedFourLaneBlockageAVGID') + Number( avgDurationSavings ) ),
							numManagedIncidents: tfFourLane.compliantDrivers
						});
					case 4:
						var tfThreeLane = _this.getCompliance( segment, strPeak, 'ThreeLane', applySavings );
						blockages.push({
							name: 'threeLaneBlockage',							
							savings: Number( avgDurationSavings ),
							avgIncidentDuration:  _this.incidentDurationAVG( tfThreeLane.laneDuration ),
							avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'ThreeLaneBlockageAVGID') + Number( avgDurationSavings ) ),
							numManagedIncidents: tfThreeLane.nonCompliantDrivers
						});
						blockages.push({
							name: 'improvedThreeLaneBlockage',							
							savings: Number( avgDurationSavings ),
							avgIncidentDuration:  _this.incidentDurationAVG( tfThreeLane.improvedLaneDuration ),
							avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'improvedThreeLaneBlockageAVGID') + Number( avgDurationSavings ) ),
							numManagedIncidents: tfThreeLane.compliantDrivers
						});
					case 3:
						var tfTwoLane = _this.getCompliance( segment, strPeak, 'TwoLane', applySavings );
						blockages.push({
							name: 'twoLaneBlockage',							
							savings: Number( avgDurationSavings ),
							avgIncidentDuration:  _this.incidentDurationAVG( tfTwoLane.laneDuration ),
							avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'TwoLaneBlockageAVGID') + Number( avgDurationSavings ) ),
							numManagedIncidents: tfTwoLane.nonCompliantDrivers
						});
						blockages.push({
							name: 'improvedTwoLaneBlockage',							
							savings: Number( avgDurationSavings ),
							avgIncidentDuration:  _this.incidentDurationAVG( tfTwoLane.improvedLaneDuration ),
							avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'improvedTwoLaneBlockageAVGID') + Number( avgDurationSavings ) ),
							numManagedIncidents: tfTwoLane.compliantDrivers
						});
					default:
						var tfOneLane = _this.getCompliance( segment, strPeak, 'OneLane', applySavings );
						blockages.push({
							name: 'oneLaneBlockage',							
							savings: Number( avgDurationSavings ),
							avgIncidentDuration:  _this.incidentDurationAVG( tfOneLane.laneDuration ),
							avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'OneLaneBlockageAVGID') + Number( avgDurationSavings ) ),
							numManagedIncidents: tfOneLane.nonCompliantDrivers
						});
						blockages.push({
							name: 'improvedOneLaneBlockage',							
							savings: 0,
							avgIncidentDuration:  _this.incidentDurationAVG( tfOneLane.improvedLaneDuration ),
							avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'ImprovedOneLaneBlockageAVGID') ),
							numManagedIncidents: tfOneLane.compliantDrivers
						});
						var tfShoulder = _this.getCompliance( segment, strPeak, 'Shoulder', applySavings );
						blockages.push({
							name: 'shoulderBlockage',							
							savings: Number( avgDurationSavings ),
							avgIncidentDuration:  _this.incidentDurationAVG( tfShoulder.laneDuration ),
							avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'ShoulderBlockageAVGID') + Number( avgDurationSavings ) ),
							numManagedIncidents: tfShoulder.nonCompliantDrivers
						});
						blockages.push({
							name: 'improvedShoulderBlockage',							
							savings: 0,
							avgIncidentDuration:  _this.incidentDurationAVG( tfShoulder.improvedLaneDuration ),
							avgIncidentDurationWithSavings: _this.incidentDurationAVG( segment.get( strPeak + 'ImprovedShoulderBlockageAVGID') ),
							numManagedIncidents: tfShoulder.compliantDrivers
						});
					break;
				}//- switch
				// Add blockages to the peak object
				objPeak.blockages = blockages;
			}
			// return the peak object
			return objPeak;
		};

		// Begins the process of the calculations.
		// Builds Peak Objects for each active operation time based on user input.
		// @param segment - represents the current segment being calculated.
		// @param string projectState - user defined state of the Project.
		// @param boolean applySavings - if true, we will use the improved blockages.
		this.calculateDelaySavings = function( segment, projectState, applySavings ) {
			applySavings = applySavings || false;
			var _this = this;
			// build peak object
			var peaks = ['amPeak', 'pmPeak', 'weekdayOffPeak', 'weekend'];
			var objPeaks = [];
			var tmpPeak = {};
			// Create an array of peaks that are active or visible
			_.each(peaks, function( peak ) {
				// Build peak object
				tmpPeak = Object.create( _this.buildPeak( segment, peak, applySavings ) );
				// Check if peak object was built and add it to peaks array
				// otherwise skip it ensuring we only have active peak objects
				if( tmpPeak.name !== undefined ) {
					objPeaks.push( tmpPeak );
				}
			});
			// For each peak object get other properties needed for calculations
      _.each(	objPeaks, function( peak ) {
      	var tempPeak = Object.getPrototypeOf( peak );
      	// Get the rounded traffic volume for this peak
        tempPeak.roundedTrafficVolume = _this.getRoundedTrafficVolume( tempPeak.trafficVolume );
        // Build a separate weather object to make calculations
        // a lot easier to understand and debug
        tempPeak.weather = _this.buildWeatherObject( segment );
        // Get the number of incidents for each weather defined by the user
        tempPeak.incidentsByWeather = _this.getIncidentsByWeather( peak );

        Object.defineProperty( peak, 'prototype', tempPeak);
      });
      // Get the travel delays for each peak's incident by weather
      var carPercentage = 0;
      var truckPercentage = 0;
      var fuelCost = _this.fuelPrices[projectState];
			_.each( objPeaks, function( peak ) {
				peak = Object.getPrototypeOf( peak );
				_.each( peak.incidentsByWeather, function( meta ) {
					meta.incidentDuration = meta.avgIncidentDuration.value / 60;
					// Compute the percentage of incidents for cars and trucks
					carPercentage = (100 - peak.truckPercentage) / 100;
					truckPercentage = peak.truckPercentage / 100;
					// Get travel delays without savings for 1 incident
					meta.travelDelayCar 	= _this.getTravelDelayCar( meta, peak.truckPercentage, peak.peakTrafficVolume, segment.get('generalTerrain') ) * meta.incidents;
					meta.travelDelayTruck = _this.getTravelDelayTruck( meta, peak.truckPercentage, peak.peakTrafficVolume, segment.get('generalTerrain') ) * meta.incidents;
					// Total travel delay for an incident
					meta.totalTravelDelayCarAndTruck = meta.travelDelayCar + meta.travelDelayTruck;
					// Calculate Savings for Car, Truck, and the total savings for both
					meta.travelDelayCarSavings = meta.travelDelayCar;
					meta.travelDelayTruckSavings =  meta.travelDelayTruck;
					meta.travelDelaySavings = meta.totalTravelDelayCarAndTruck;
					// Calculate fuel consumption
					meta.fuelConsumptionGrams = _this.getFuelConsumption( meta, peak.peakTrafficVolume );
					meta.fuelConsumptionCorrection = _this.getFuelConsumptionCorrection( truckPercentage, segment.get('generalTerrain') ) * 907185;
					// Actual Fuel Consumption - USE FOR SAVINGS CALCULATIONS
					meta.fuelConsumptionTotal = meta.fuelConsumptionGrams + meta.fuelConsumptionCorrection;
					meta.fuelConsumptionTotalGallons = meta.fuelConsumptionTotal / 2834.95 * meta.incidents;
					// Calculate the fuel savings in gallon
					meta.fuelSavingsGallons = meta.fuelConsumptionTotalGallons;
					// Monetize the fuel savings in gallon
					meta.fuelSavings = meta.fuelSavingsGallons * fuelCost;
					// Compute for with and without SSP with corrections:
					meta.COEmission = 20.9 * 22.1 * meta.fuelConsumptionTotalGallons;
					meta.CO2Emission = 451 * 22.1 * meta.fuelConsumptionTotalGallons;
					meta.HCEmission = 2.8 * 22.1 * meta.fuelConsumptionTotalGallons;
					meta.NOxEmission = 1.39 * 22.1 * meta.fuelConsumptionTotalGallons;
					meta.SOxEmission = 2 * (80 / 1000000) * meta.fuelConsumptionTotalGallons;
					// Calculate emission savings
					meta.COEmissionSavings = meta.COEmission / 1000000;
					meta.CO2EmissionSavings = meta.CO2Emission / 1000000;
					meta.HCEmissionSavings = meta.HCEmission / 1000000;
					meta.NOxEmissionSavings = meta.NOxEmission / 1000000;
					meta.SOxEmissionSavings = meta.SOxEmission;
					// increased shoulder blockage shouldn't be part of
					// calculating secondary incidents.
					meta.secondaryIncidents = segment.get('secondaryIncidentsPercentage') / 100 * meta.incidents;
				});

			});

			_this.calculateTotalPeakSavings( objPeaks, applySavings );

			return objPeaks;

		};

		this.calculateTotalPeakSavings = function( arrPeaks, applySavings ) {
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
				var totalSecondaryIncidents = 0;

				// go through each blockage by weather and get the sum of its
				// properties
				_.each( peak.incidentsByWeather, function( meta ) {
					// increased shoulder blockage shouldn't be part of the
					// calculation of savings
					totalPeakTravelDelaySavings += meta.travelDelaySavings;
					totalPeakTravelDelayCarSavings += meta.travelDelayCarSavings;
					totalPeakTravelDelayTruckSavings += meta.travelDelayTruckSavings;
					// Fuel Consumption
					totalFuelConsumptionGallons += meta.fuelConsumptionTotalGallons;
					totalFuelSavings += meta.fuelSavings;
					totalFuelSavingsGallons += meta.fuelSavingsGallons;
					// these are for secondary incidents
					totalTravelDelay += meta.totalTravelDelayCarAndTruck;
					totalSecondaryIncidents += meta.secondaryIncidents;
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
					totalSecondaryIncidents: totalSecondaryIncidents,
				};
			});

			return arrPeaks;

		};

		// This searches within a given table, which is a JSON object
		// and returns a value depending on the given parameters
		// @param object delayTable - JSON object containing travel delays
		// @param number speed - an integer value in kilometers
		// @param number duration - an integer value in seconds
		// @param number volume - an integer value of the volume of traffic
		// @param number lane - number of lanes by direction
		// @param number blockage - a number representing a blockage e.g. 0 means Shoulder Blockage
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
		// @param object meta = Incident By Weather object
		// @param number trafficVolume - user defined traffic volume for the current
		// peak period.
		// @param boolean withSavings - if true, we will use the average incident
		// duration with savings. Primarily used for SSP.
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

			var c00 = dLsLvL * ( 1 - durationDiff ) + dUsLvL * durationDiff;
			var c10 = dLsUvL * ( 1 - durationDiff ) + dUsUvL * durationDiff;
			var c01 = dLsLvU * ( 1 - durationDiff ) + dUsLvU * durationDiff;
			var c11 = dLsUvU * ( 1 - durationDiff ) + dUsUvU * durationDiff;

			var c0 = c00 * ( 1 - speedDiff) + c10 * speedDiff;
			var c1 = c01 * ( 1 - speedDiff) + c11 * speedDiff;

			return c0 * ( 1 - volumeDiff ) + c1 * volumeDiff;

		};

		// This returns a number used for correcting fuel consumption taken
		// from the table given by UMD.
		// @param number truckPercentage - the percentage of trucks given by
		// the user for this peak period.
		// @param generalTerrain - user defined General Terrain for the segment. 
		this.getFuelConsumptionCorrection = function( truckPercentage, generalTerrain ) {
			var _this = this;
			var COMP = truckPercentage * 100;
			var GRADIENT = _this.getGeneralTerrainImpact( generalTerrain );

			var x = ( 0.001 * COMP ) - ( 0.015 * GRADIENT ) + ( 0.001 * ( GRADIENT * GRADIENT ) );

			return Math.pow(Math.E, x);
		};

		// Returns a travel delay based on a given object and table
		// @param object meta - the peak object we are currently working on.
		// @param object table - is an object containing travel delays from
		// a JSON table made by UMD.
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

			var TD, TDSU, TDSL, SUIUTD, SLILTD, SUILTD, SLIUTD;
			// This allows us to check for errors without breaking
			// the application flow by counting errors and just
			// publish an event when an error is found.
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

		// This returns the calculated travel delay based on the
		// table for cars.
		// @param object meta - the current peak object.
		// @param Integer truckPercentage - the user defined percentage of
		// trucks within 0 - 25 range.
		// @param number trafficVolume - the user defined volume of traffic
		// for the given peak period.
		// @param number generalTerrain - user selected General Terrain for
		// the current segment.
		// @param boolean savings - if true, we use the Average Incident Duration
		// with savings. Primarily used in SSP tool.
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

		// This returns the calculated travel delay based on the
		// table for trucks.
		// @param object meta - the current peak object.
		// @param Integer truckPercentage - the user defined percentage of
		// trucks within 0 - 25 range.
		// @param number trafficVolume - the user defined volume of traffic
		// for the given peak period.
		// @param number generalTerrain - user selected General Terrain for
		// the current segment.
		// @param boolean savings - if true, we use the Average Incident Duration
		// with savings. Primarily used in SSP tool.
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

		// Return the wage based on the Project's State and Region
		// @param state - this is the user defined project state.
		// @param region - this is the selected region for the 
		// current segment.
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
		//Added by Fang Zhou for adding Monetary conversion rates table on 09/15/2015
        this.getFuelCost = function( state ) {
            var _this = this;
            var fuelCost = 0;

            fuelCost = _this.fuelPrices[state];

            return Number( fuelCost );

        };
        //Added end for adding Monetary conversion rates table on 09/15/2015

		// This returns the sum of all emission savings
		// @param incidentsByWeather - an object derived from the percentage
		// of managed incidents by a weather value input by the user.
		// @return segmentEmissions - an object containing emission totals 
		// for the given incidentsByWeather
		this.calculateTotalEmissions = function( incidentsByWeather ) {

			var segmentEmissions = {
				COEmission : 0,
				CO2Emission : 0,
				HCEmission : 0,
				NOxEmission : 0,
				SOxEmission : 0
			};

			_.each( incidentsByWeather, function( meta ) {
				segmentEmissions.COEmission -= meta.COEmissionSavings;
				segmentEmissions.CO2Emission -= meta.CO2EmissionSavings;
				segmentEmissions.HCEmission -= meta.HCEmissionSavings;
				segmentEmissions.NOxEmission -= meta.NOxEmissionSavings;
				segmentEmissions.SOxEmission -= meta.SOxEmissionSavings;
			});

			return segmentEmissions;

		};


		// Driver Removal Laws Functions
		// @param segment - the segment model
		// this.calculateDriverRemoval = function( segment ) {
		// 	var peaks = ['amPeak', 'pmPeak', 'weekdayOffPeak', 'weekend'];
		// 	var proportion = segment.get('proportion') / 100;
		// 	var implementation = segment.get('implementation') / 100;
		// 	implementation = ( isFinite(implementation) ) ? implementation : 0;
		// 	var averageImprovement = segment.get('averageImprovement');

		// 	// Loop through each Peak Period and use the calculateCompliance
		// 	// function since anonymous callbacks are harder to debug.
		// 	_.each( peaks, calculateCompliance );

		// 	// Function for calculating the Driver Removal Law.
		// 	function calculateCompliance( peak ) {
		// 		// Get the number of managed incidents for one lane blockages.
		// 		var oneLaneIncidents = Number( segment.get( peak + 'OneLaneBlockageManIndt' ) );
		// 		// Calculate the proportion of incidents that are made shorter.
		// 		var proportionedIncidents = oneLaneIncidents * proportion;
		// 		// Calculate the number of compliant drivers.
		// 		var compliantDrivers = proportionedIncidents * implementation;
		// 		// Update the Number of Managed Incidents for One Lane Blockage
		// 		// and Shoulder Blockage.
		// 		segment.set( peak + '_OneLaneBlockageManIndt', oneLaneIncidents - compliantDrivers );
		// 		segment.set( peak + '_OneLaneBlockageAVGID', segment.get(peak + 'OneLaneBlockageAVGID') );
		// 		var shoulderIncidents = Number( segment.get(peak + 'ShoulderBlockageManIndt') );
		// 		segment.set( peak + '_ShoulderBlockageManIndt', shoulderIncidents + compliantDrivers );
		// 		segment.set( peak + '_ShoulderBlockageAVGID', segment.get(peak + 'ShoulderBlockageAVGID') );
		// 		// Append incidents with the Average Shortened Incident Duration
		// 		// to the Segment.
		// 		segment.set( peak + '_ShortenedBlockageManIndt', compliantDrivers);
		// 		segment.set( peak + '_ShortenedBlockageAVGID', averageImprovement);
		// 	} 

		// }

		// Return SavingsCTRL
		return this;
	};

	return SavingsCTRL;

});