/* globals define */

define([
	'underscore',
	], function() {
		// Constructor
		var SSPOutputCTRL = function() {

			this.constructor = this;

			// Return the sum of all segments fuel savings in money
			this.calculateFuelSavings = function( segments ) {
	      var totalFuelSavings = 0;
				_.each( segments, function( segment ) {
					if( ( ( segment.get('checked') == 'checked' || segment.get('checked') == true ) ) && segment.get('valid') === true ) {
          	totalFuelSavings += segment.get('totalFuelSavings');
					}
				});
				return totalFuelSavings;
			}
			// Return the sum of all segments fuel savings in gallons
			this.calculateFuelSavingsGallons = function( segments ) {
	      var totalFuelSavingsGallons = 0;
				_.each( segments, function( segment ) {
					if( ( segment.get('checked') == 'checked' || segment.get('checked') == true ) && segment.get('valid') === true ) {
          	totalFuelSavingsGallons += segment.get('totalFuelSavingsGallons');
					}
				});
				return totalFuelSavingsGallons;
			}
			// Return the sum of all segments savings
			this.calculateProjectSavings = function( segments ) {
	      var totalSavings = 0;
				_.each( segments, function( segment ) {
					if( ( segment.get('checked') == 'checked' || segment.get('checked') == true ) && segment.get('valid') === true ) {
          	totalSavings += segment.get('totalSegmentSaving');
					}
				});
				return totalSavings;
			}
			// Calculate a projects total benefit
			this.calculateBenefits = function( segments ) {
	      // Variables for monetizing the benefits
	      var driverWage = 0;
	      var totalTruckMoney = 0;
	      var totalCarMoney = 0;
	      // Goes through each segment and summarize savings
	      _.each( segments, function( segment ) {
		      // Variables for getting the total savings in seconds
		      var totalSavingsCar = 0;
		      var totalSavingsTruck = 0;
	        if( ( segment.get('checked') == 'checked' || segment.get('checked') == true ) && segment.get('valid') === true ) {
	          totalSavingsCar += segment.get('totalSegmentSavingCar');
	          totalSavingsTruck += segment.get('totalSegmentSavingTruck');

	          driverWage = segment.get('driverWage');
	          // summarizes total truck savings and monetize it by multiplying
	          // the hours by 67
	          totalTruckMoney += totalSavingsTruck * 67;
	          // same as with truck but multiplies it to each segment's driver wage
	          totalCarMoney += totalSavingsCar * driverWage;
	        }
	      });
	      var benefit = totalTruckMoney + totalCarMoney;
	      // this checks if benefit cost ration is not a number and converts it to zero
	      if( isNaN( benefit ) ) {
	      	benefit = 0;
	      }

	      return benefit;

			};

			this.getIncidentRatioAVGDuration = function( peak, segment ) {
				var numOfLanes = segment.get('numberOfTrafficLanesByDirection');
				var averageDurationSavings = segment.get('averageDurationSavings');
				var tempIncidentDuration = 0;
				var tempManagedIncident = 0;
				var secondaryIncidentsPercentage = segment.get('secondaryIncidentsPercentage') / 100;
				var avgIncidentDurations = [];

				switch( numOfLanes ) {
					case 6:
					case 5:
						tempIncidentDuration = segment.get( peak + 'FourLaneBlockageAVGID');
						tempManagedIncident = segment.get( peak + 'FourLaneBlockageManIndt');

						incidentDurationRatio = tempIncidentDuration / (tempIncidentDuration - averageDurationSavings);
						secondaryIncidents = tempManagedIncident * secondaryIncidentsPercentage

						avgIncidentDurations.push({ 
							avgID: incidentDurationRatio,
							numSI: secondaryIncidents,
							total: incidentDurationRatio * secondaryIncidents
						});
					case 4:
						tempIncidentDuration = segment.get( peak + 'ThreeLaneBlockageAVGID');
						tempManagedIncident = segment.get( peak + 'ThreeLaneBlockageManIndt');

						incidentDurationRatio = tempIncidentDuration / (tempIncidentDuration - averageDurationSavings);
						secondaryIncidents = tempManagedIncident * secondaryIncidentsPercentage

						avgIncidentDurations.push({ 
							avgID: incidentDurationRatio,
							numSI: secondaryIncidents,
							total: incidentDurationRatio * secondaryIncidents
						});
					case 3:
						tempIncidentDuration = segment.get( peak + 'TwoLaneBlockageAVGID');
						tempManagedIncident = segment.get( peak + 'TwoLaneBlockageManIndt');

						incidentDurationRatio = tempIncidentDuration / (tempIncidentDuration - averageDurationSavings);
						secondaryIncidents = tempManagedIncident * secondaryIncidentsPercentage

						avgIncidentDurations.push({ 
							avgID: incidentDurationRatio,
							numSI: secondaryIncidents,
							total: incidentDurationRatio * secondaryIncidents
						});
					case 2:
						tempIncidentDuration = segment.get( peak + 'OneLaneBlockageAVGID');
						tempManagedIncident = segment.get( peak + 'OneLaneBlockageManIndt');

						incidentDurationRatio = tempIncidentDuration / (tempIncidentDuration - averageDurationSavings);
						secondaryIncidents = tempManagedIncident * secondaryIncidentsPercentage

						avgIncidentDurations.push({ 
							avgID: incidentDurationRatio,
							numSI: secondaryIncidents,
							total: incidentDurationRatio * secondaryIncidents
						});
						tempIncidentDuration = segment.get( peak + 'ShoulderBlockageAVGID');
						tempManagedIncident = segment.get( peak + 'ShoulderBlockageManIndt');

						incidentDurationRatio = tempIncidentDuration / (tempIncidentDuration - averageDurationSavings);
						secondaryIncidents = tempManagedIncident * secondaryIncidentsPercentage

						avgIncidentDurations.push({ 
							avgID: incidentDurationRatio,
							numSI: secondaryIncidents,
							total: incidentDurationRatio * secondaryIncidents
						});
					break;
				}

				return avgIncidentDurations;

			};

			this.getIncidentRatioBlockages = function( peak, segment ) {
				var tempDurationSavings = 0;
				var tempIncidentDuration = 0;
				var tempManagedIncident = 0;
				var avgIncidentDurations = [];

				var incidentDurationRatio = 0;
				var secondaryIncidents = 0;

				var numOfLanes = segment.get('numberOfTrafficLanesByDirection');
				var secondaryIncidentsPercentage = segment.get('secondaryIncidentsPercentage') / 100;

				switch( numOfLanes ) {
					case 6:
					case 5:
						tempIncidentDuration = segment.get( peak + 'FourLaneBlockageAVGID');
						tempManagedIncident = segment.get( peak + 'FourLaneBlockageManIndt');
						tempDurationSavings = segment.get('fourLaneBlockageSavings');

						incidentDurationRatio = tempIncidentDuration / (tempIncidentDuration - tempDurationSavings);
						secondaryIncidents = tempManagedIncident * secondaryIncidentsPercentage;

						avgIncidentDurations.push({
							avgID: incidentDurationRatio,
							numSI: secondaryIncidents,
							total: incidentDurationRatio * secondaryIncidents
						});
					case 4:
						tempIncidentDuration = segment.get( peak + 'ThreeLaneBlockageAVGID');
						tempManagedIncident = segment.get( peak + 'ThreeLaneBlockageManIndt');
						tempDurationSavings = segment.get('threeLaneBlockageSavings');

						incidentDurationRatio = tempIncidentDuration / (tempIncidentDuration - tempDurationSavings);
						secondaryIncidents = tempManagedIncident * secondaryIncidentsPercentage;

						avgIncidentDurations.push({ 
							avgID: incidentDurationRatio,
							numSI: secondaryIncidents,
							total: incidentDurationRatio * secondaryIncidents
						});
					case 3:
						tempIncidentDuration = segment.get( peak + 'TwoLaneBlockageAVGID');
						tempManagedIncident = segment.get( peak + 'TwoLaneBlockageManIndt');
						tempDurationSavings = segment.get('twoLaneBlockageSavings');

						incidentDurationRatio = tempIncidentDuration / (tempIncidentDuration - tempDurationSavings);
						secondaryIncidents = tempManagedIncident * secondaryIncidentsPercentage;

						avgIncidentDurations.push({ 
							avgID: incidentDurationRatio,
							numSI: secondaryIncidents,
							total: incidentDurationRatio * secondaryIncidents
						});
					case 2:
						tempIncidentDuration = segment.get( peak + 'OneLaneBlockageAVGID');
						tempManagedIncident = segment.get( peak + 'OneLaneBlockageManIndt');
						tempDurationSavings = segment.get('oneLaneBlockageSavings');

						incidentDurationRatio = tempIncidentDuration / (tempIncidentDuration - tempDurationSavings);
						secondaryIncidents = tempManagedIncident * secondaryIncidentsPercentage

						avgIncidentDurations.push({ 
							avgID: incidentDurationRatio,
							numSI: secondaryIncidents,
							total: incidentDurationRatio * secondaryIncidents
						});

						tempIncidentDuration = segment.get( peak + 'ShoulderBlockageAVGID');
						tempManagedIncident = segment.get( peak + 'ShoulderBlockageManIndt');
						tempDurationSavings = segment.get('shoulderBlockageSavings');

						incidentDurationRatio = tempIncidentDuration / (tempIncidentDuration - tempDurationSavings);
						secondaryIncidents = tempManagedIncident * secondaryIncidentsPercentage;

						avgIncidentDurations.push({ 
							avgID: incidentDurationRatio,
							numSI: secondaryIncidents,
							total: incidentDurationRatio * secondaryIncidents
						});
					break;
				}

				return avgIncidentDurations;

			};

			// this.calculateSecondaryIncidents = function( segments ) {
			// 	var _this = this;
			// 	var peaks = ['amPeak', 'pmPeak', 'weekdayOffPeak', 'weekend'];
			// 	var incidentDurationRatios = [];
			// 	var secondaryIncidents = [];
			// 	_.each( segments, function( segment ) {
			// 		if( ( segment.get('checked') == 'checked' || segment.get('checked') == true ) && segment.get('valid') === true ) {
			// 			_.each( peaks, function( peak ) {
			// 				if( segment.get( peak + 'Checked') == 'checked' ) {
			// 					if( segment.get('averageDurationActive') == 'active') {
			// 						incidentDurationRatios.push( _this.getIncidentRatioAVGDuration( peak, segment ) );
			// 					} else {
			// 						incidentDurationRatios.push( _this.getIncidentRatioBlockages( peak, segment ) );
			// 					}
			// 				}
			// 			});
			// 		}
			// 	});

			// 	return _this.calculateSecondaryIncidentsSavings( incidentDurationRatios );

			// };

			this.calculateSecondaryIncidents = function( segments ) {
				var secondaryIncidents = 0;
				_.each( segments, function( segment ) {
		 			if( ( segment.get('checked') == 'checked' || segment.get('checked') == true ) && segment.get('valid') === true ) {
		 				secondaryIncidents += segment.get('totalSegmentSecondaryIncidents');
		 			}
		 		});

		 		return secondaryIncidents;
			};

			return this;

		};


		return SSPOutputCTRL;

	});