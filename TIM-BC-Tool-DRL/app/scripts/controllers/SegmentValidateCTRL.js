/* globals define */

define([
	'underscore',
	], function() {

		var SegmentValidateCTRL = function() {
      /****
        Validate Segment Information Page
        ****/
      this.validateSegments = function( segments ) {
        var _this = this;
        var valid = [];
        _.each( segments, function( segment ) {
          valid.push( _this.validateCurrentSegment( segment ) );
        });

        //return valid;
      };

      this.validateCurrentSegment = function( segment ) {
        this.validateTrafficInfo( segment );
      };

      /****
        Roadway Geometry
        ****/


      this.validateRoadwayGeometry = function( evnt ) {
        //Grab all input in this panel
        var $segmentLength = $('#segment_length');
        var $numLanes = $('#num_of_traffic_lanes');
        var $numRamps = $('#number_of_ramps');
        var invalid = 0;

        if( ! Number( $segmentLength.val() ) > 0 ) {
          $segmentLength.parent().addClass('has-error');
          invalid++;
        } else {
          $segmentLength.parent().removeClass('has-error');
        }

        var value = Number( $numLanes.val() );

        if( value == '' || value < 2 || value > 6 ) {
          $numLanes.parent().addClass('has-error');
          invalid++;
        } else {
          $numLanes.parent().removeClass('has-error');
        }

        if( Number($numRamps.val()) < 0 ) {
          $numRamps.parent().addClass('has-error');
          invalid++;
        } else {
          $numRamps.parent().removeClass('has-error');
        }

        if( invalid == 0 ) {
          $('#roadway_geometry')
            .removeClass('panel-info')
            .addClass('panel-success')
            .find('.information-correct')
            .removeClass('hidden')
            .siblings('.information-wrong')
            .addClass('hidden');
        } else {
          $('#roadway_geometry')
            .removeClass('panel-success')
            .addClass('panel-info')
            .find('.information-correct')
            .addClass('hidden');
        }

        return invalid == 0;
      };

      /****
        SSP Program Information
        ****/
      this.validateProgramInformation = function ( segment ) {
        var opTimeValid = this.validateOperationTime();
        var iDurationValid = true; //this.validateIncidentDurations( segment );
        //console.log(opTimeValid + ' --:-- ' + iDurationValid );
        if( opTimeValid && iDurationValid ) {
          $('#drl_program_information')
            .removeClass('panel-info')
            .addClass('panel-success')
            .find('.information-correct')
            .removeClass('hidden');
        } else {
          $('#drl_program_information')
            .removeClass('panel-success')
            .addClass('panel-info')
            .find('.information-correct')
            .addClass('hidden');
        }
      };

      // Validate the Operation Time checkboxes
      this.validateOperationTime = function() {
        var arrOTime = $('.operation-time');
        var checkedOT = [];
        _.each( arrOTime, function( opTime ) {
          if( $(opTime).prop('checked') == true ) {
            checkedOT.push($(opTime));
          }
        });
        // reverse the result so that this being 0 is valid
        // meaning at least 1 operation time is checked.
        return checkedOT.length > 0;
      };

      // Validate Incident Durations
      this.validateIncidentDurations = function( segment ) {
        // Check if Average Incident Duration Savings is active
        var avgActive = segment.get('averageDurationActive') == 'active' || segment.get('averageDurationActive') == true;
        // Build an array of all Average Incident Durations 
        var arrDurations = $('.avg-incident-duration'),
            savBlock = '',
            durBlock = '';
        // Error holder and checker
        var hasErrors = [];
        var durationEmpty = [];
        var visibleDurations = [];
        var exceedDuration = 0;
        if( avgActive ) {
          var value = segment.get('averageDurationSavings');
          if( value <= 0 ) {
            $('#avg_duration_container').addClass('has-error');
            $('#savings_error').html('<p style="margin-top: 10px;">Please enter a number greater than 0.</p>');
            hasErrors.push( value );
          } else {
            if( value > 0 ) {
              $('#avg_duration_container').removeClass('has-error');
              $('#savings_error').html('');
            }
            _.each( arrDurations, function( duration ) {
              duration = $(duration);
              if( ! duration.closest('.peak-incident').hasClass('hidden') ) {
                visibleDurations.push( duration );
                var dursValue = parseInt( duration.val() );
                if( dursValue <= 0 ) {
                  durationEmpty.push( duration );
                }
                /*if( dursValue >= 0 && value > dursValue ) {
                  hasErrors.push( value );
                } else */ if( dursValue + value > 240 ) {
                  //alert('Error: Incident Duration error!\nThe SUM of any Average Incident Duration and it\'s respective Incident Duration Savings should not exceed 240 minutes.');
                  hasErrors.push( value );
                  exceedDuration++;
                }
              }
            });
          }
        } else {
          var arrSavings = $('.lane-savings');
          _.each( arrSavings, function( saving ) {
            savBlock = $(saving).data('block');
            var savingsValue = Number($(saving).val());
            _.each( arrDurations, function( duration ) {
              durBlock = $(duration).data('lane');
              dursValue = Number($(duration).val());
              if( ! $(duration).closest('.peak-incident').hasClass('hidden')) {
                visibleDurations.push( duration );
                // if( dursValue <= 0 )
                // console.log(savBlock + ' -=-=- ' + durBlock);
                if( savBlock == durBlock ) {
                  if( savingsValue < 0 ) {
                    hasErrors.push( savingsValue );
                  } else if( savingsValue + dursValue > 240 ) {
                    //alert('Error: Incident Duration error!\nThe SUM of any Average Incident Duration and it\'s respective Incident Duration Savings should not exceed 240 minutes.');
                    exceedDuration++;
                    hasErrors.push( savingsValue );
                  }
                }
              }
            });
          });
        }

        if( exceedDuration > 0 ) {
          $('#savings_exceed_error').html('<p style="margin-top: 10px;">Total incident duration (sum of post-TIM incident duration and duration savings) should not exceed 240 minutes.</p>');
        } else {
          $('#savings_exceed_error').html('');
        }

        return hasErrors.length == 0 && durationEmpty.length != visibleDurations.length;
      };

      this.validateSpeedLimit = function() {
        var $element = $('#mainlane_speed_limit');
        var value = Number( $element.val() );
        if( value > 0 ) {
          $element.parent().removeClass('has-error');
          return true;
        } else {
          $element.parent().addClass('has-error');
          return false;
        }
      };

      this.validateTrafficVolume = function( value ) {
        value = Number( value );
        var valid = false;

        if( value > 0 ) {
          if( value >= 500 && value <= 2200 ) {
            valid = true;
          }
        }

        this.validateElements('.traffic-volume');

        return valid;
      };

      this.validateTruckPercentage = function( evnt ) {
        var $el = $(evnt.currentTarget);
        var parent = $el.parent();
        var value = Number( $el.val() );
        var valid = true;

        if( isNaN( value ) || value < 0 || value > 25 ) {
          parent.addClass('has-error');
          valid = false;
        } else {
          parent.removeClass('has-error');
          valid = true;
        }

        this.validateElements('.truck-percentage');

        return valid;
      };

			this.validateWeatherType = function( evnt ) {
				var el = evnt.currentTarget;
        var weather = $(el).closest('tr').attr('id');
        var weatherSiblings = $('.weather');
        var siblingPercent = $('#' + weather).find('.percentage');
        var value = $(el).val();
        var visible = null;
        var visibleWeather = [];
        var compare;
        var errorFlag = false;

        if( value != 'Select Type') {
          $(siblingPercent).prop('readonly', false);
        } else {
          $(siblingPercent).prop('readonly', true);
        }

        _.each( weatherSiblings, function( weatherSibling ) {
          visible = $(weatherSibling).closest('tr').hasClass('visible');
          if( visible && $(weatherSibling).closest('tr').attr('id') != weather ) {
            visibleWeather.push( weatherSibling );
          }
        });

        _.each( visibleWeather, function( meta ) {
          compare = $(meta).val();
          if( value == compare) {
          	errorFlag = true;
          }
        });

        if( errorFlag == true ) {
          alert('Error: Please correct your Weather Information.');
          $(el).parent().addClass('has-error');
        } else {
          $(el).parent().removeClass('has-error');
        }

        this.validateElements( '.weather' );
				
				return this;
			};

			this.validateWeatherPercentage = function( evnt ) {
        var el = evnt.currentTarget;
        var weather = $(el).closest('tr').attr('id');
        var percentSiblings = $('.percentage');
        var value = Number($(el).val());
        var visible = null, sum = value;
        var visibleWeather = [];

        _.each( percentSiblings, function( percentSibling ) {
          //console.log(percentSibling);
          visible = $(percentSibling).closest('tr').hasClass('visible');
          if( visible && $(percentSibling).closest('tr').attr('id') != weather ) {
            visibleWeather.push( percentSibling );
          }
        });

        _.each( visibleWeather, function( meta ) {
          sum += parseInt($(meta).val());
        });

        if( sum != 100 ) {
          $('.error-weather').removeClass('hidden');
          $(el).parent().addClass('has-error');
        } else {
          $('.error-weather').addClass('hidden');
          $(el).parent().removeClass('has-error');
        }

        this.validateElements( '.percentage' );
				this.validateTrafficInfo();

        return this;
			};
      /***
        Execute certain validation functions based on the element
        parameter given..
        @param elementClass = a string containing a group of 
          elements' class e.g. '.traffic-volume'.
        ***/
			this.validateElements = function( elementClass ) {
				var tempWeather;
				var weatherInputs = $(elementClass);
				var visibleElement = [];
				var visible = false, total = 0;
        var withErrors = [];

        _.each( weatherInputs, function( weatherInput ) {
          visible = $(weatherInput).closest('tr').hasClass('visible');
          if( visible ) {
            visibleElement.push( weatherInput );
          }
        });

				if( elementClass === '.weather' ) {
          return this.checkWeatherType( visibleElement, elementClass );
				} else if( elementClass === '.percentage' ) {
          return this.checkWeatherPercentage( visibleElement, elementClass );
				} else if( elementClass === '.traffic-volume' ) {
          return this.checkTrafficVolume( visibleElement, elementClass );
        } else if( elementClass === '.truck-percentage') {
          return this.checkTruckPercentage( visibleElement, elementClass );
        }

			};
      /***
        Loop through and find a match for each element in
        the visibleWeather array..
        @params visibleWeather = an array of Select elements containing
          weather types e.h. 'Clear'.
        @params elementClass = the class that is used by all elements
          we are validating.
        ***/
      this.checkWeatherType = function( visibleWeather, elementClass ) {
        var withErrors = [];
        var tempValue = '';
        for( var x = 0, len = visibleWeather.length; x < len; x++ ) {
          tempWeather = visibleWeather[x];
          tempValue = $(tempWeather).val();
          // If the value of a weather type is Select Type
          // exit and return false immediately
          if( tempValue === 'Select Type' ) {
            return false;
          }
          for( var y = x + 1, len = visibleWeather.length; y < len; y++ ) {
            if( tempValue == $(visibleWeather[y]).val() ) {
              withErrors.push( tempWeather );
            }
          }
        }
        if( withErrors.length == 0 ) {
          $(elementClass).parent().removeClass('has-error');
          return true;
        } else {
          return false;
        }
      };

      /***
        Loop through and get the total of percentage inputs and make
        sure they add up to 100..
        @params visibleWeather = an array of Input elements containing
          weather percentages.
        @params elementClass = the class that is used by all elements
          we are validating.
        ***/
      this.checkWeatherPercentage = function( visibleWeather, elementClass ) {
        var total = 0;
        for( var x = 0, len = visibleWeather.length; x < len; x++ ) {
          total += Number($(visibleWeather[x]).val());
        }
        if( total == 100 ) {
          $(elementClass).parent().removeClass('has-error');
          return true;
        } else {
          return false;
        }
      };

      /***
        Loop through and check that no value is equal to 0
        @params trafficVolumes = an array of Input elements containing
          weather percentages.
        @params elementClass = the class that is used by all elements
          we are validating.
        ***/
      this.checkTrafficVolume = function( trafficVolumes, elementClass ) {
        var withErrors = [];
        var trafficValue = 0;
        _.each( trafficVolumes, function( trafficVolume ) {
          trafficValue = Number( $(trafficVolume).val() );
          if( trafficValue < 500 || trafficValue > 2200  ) {
            withErrors.push( trafficVolume );
          }
        });
        if( withErrors.length === 0 ) {
          $(elementClass).parent().removeClass('has-error');
          return true;
        } else {
          return false;
        }
      };

      /***
        Loop through and check that no value is equal to 0
        @params truckPercentages = an array of Input elements containing
          weather percentages.
        @params elementClass = the class that is used by all elements
          we are validating.
        ***/
      this.checkTruckPercentage = function( truckPercentages, elementClass ) {
        var withErrors = [];
        _.each( truckPercentages, function( truckPercentage ) {
          if( isNaN($(truckPercentage).val()) || Number( $(truckPercentage).val() ) < 0 || Number( $(truckPercentage).val() ) > 100 ) {
            withErrors.push( truckPercentage );
          }
        });
        if( withErrors.length === 0 ) {
          $(elementClass).parent().removeClass('has-error');
          return true;
        } else {
          return false;
        }
      };

      // Validate Traffic Information Panel
			this.validateTrafficInfo = function( segment ) {
        var trafficInfo = $('#traffic_information');
        var weatherValid = this.validateElements('.weather');
        var percentageValid = this.validateElements('.percentage');
        var trafficVolumeValid = this.validateElements('.traffic-volume');
        var truckPercentageValid = this.validateElements('.truck-percentage');
        var speedValid = this.validateSpeedLimit();
        var valid = true;

        if( speedValid && trafficVolumeValid && truckPercentageValid && weatherValid && percentageValid ) {
          trafficInfo.removeClass('panel-info');
          trafficInfo.addClass('panel-success');
          trafficInfo.find('.information-correct').removeClass('hidden');
          valid = true;
        } else {
          trafficInfo.removeClass('panel-success');
          trafficInfo.addClass('panel-info');
          trafficInfo.find('.information-correct').addClass('hidden');
          valid = false;
        }

        return valid;
			};

      /**********************************
        INCIDENT INFORMATION VALIDATION
      ***********************************/

      this.validateSecondaryPercentage = function( input ) {
        return ( Number( input ) <= 100 && Number( input ) >= 0 );
      };

      this.validateAvgIncidentDuration = function( peak ) {
        // Set up our peak, default am-peak if undefined;
        peak = peak || 'am-peak';
        peak = $('.' + peak + '-incident');

        if( peak.hasClass('hidden') ) {
          return 'hidden';
        } else {
          var avgIncidentDuration = peak.find('.avg-incident-duration');
          var managedIncident = null;
          var validRows = [],
              incompleteRows = [];
          var valAvgID, valManIn;

          _.each(avgIncidentDuration, function( avgID ) {
            $avgID = $(avgID);
            managedIncident = $avgID.closest('.peak-row').find('.num-of-managed-incidents');
            valAvgID = Number($avgID.val());
            valManIn = Number(managedIncident.val());

            if( valAvgID >= 0 ) {
              if( valManIn > 0 && valAvgID > 0 || valManIn == 0 && valAvgID == 0 ) {
                $avgID.parent().removeClass('has-error');
                $(managedIncident).parent().removeClass('has-error');
                validRows.push(1);
              } else if ( valManIn > 0 && valAvgID == 0 ) {
                $(managedIncident).parent().addClass('has-error');
                incompleteRows.push(1);
              }
            } else if( valAvgID > 0 && valManIn <= 0 ) {
              $(managedIncident).parent().addClass('has-error');
              incompleteRows.push(1);
            } else if( valAvgID <= 0 && valManIn > 0 ) {
              $avgID.parent().addClass('has-error');
              incompleteRows.push(1);
            }
          })

          return validRows.length > 0 && incompleteRows.length === 0;

        }
      };

      this.validateNumberOfIncident = function( numberOfIncidentsOnProgramHighway ) {
        var managedIncidents = $('.num-of-managed-incidents');
        var parent = null;
        var totalManagedIncidents = 0;
        _.each(managedIncidents, function( managedIncident ) {
          managedIncident = $(managedIncident);
          parent = managedIncident.closest('.peak-incident');
          if( ! parent.hasClass('hidden') ) {
            totalManagedIncidents += Number( managedIncident.val() );
          }
        });

        return totalManagedIncidents === Number( numberOfIncidentsOnProgramHighway );
      }

      this.validateIncidentDurationPeaks = function() {
        var _this = this;
        var peaks = ['am-peak', 'pm-peak', 'off-peak', 'weekend'];
        var hiddenPeaks = [];
        var validPeaks = [];
        var result = null;

        _.each(peaks, function( peak ) {
          result = _this.validateAvgIncidentDuration( peak );
          if( result == 'hidden' ) {
            hiddenPeaks.push(1);
            $('.' + peak + '-incident').removeClass('panel-success').addClass('panel-info');
          } else if( result == true ) {
            validPeaks.push(1);
            $('.' + peak + '-incident').addClass('panel-success').removeClass('panel-info');
          } else {
            $('.' + peak + '-incident').removeClass('panel-success').addClass('panel-info');
          }
        });

        return peaks.length - hiddenPeaks.length == validPeaks.length;
      };

      // This function validates that the total number of 
      // Managed Incidents for all segments are equal to 
      // the user input "Number of Annual Incidents on Program Roadway"
      // within the Project Details page.
      this.validationTotalOfManagedIncidents = function( project ) {
        // Get all the segments within our project:
        var segments = project.get('segments');
        // Define all peaks in a segment:
        var peaks = ['amPeak', 'pmPeak', 'weekdayOffPeak', 'weekend'];
        // Define the total for all managed incidents as int:
        var total = 0;
        // Object Literal for checking visibility of a peak
        var visiblePeak = {
          'amPeak': function() {
            return $('.am-peak-incident').hasClass('hidden');
          },
          'pmPeak': function() {
            return $('.pm-peak-incident').hasClass('hidden');
          },
          'weekdayOffPeak': function() {
            return $('.off-peak-incident').hasClass('hidden');
          },
          'weekend': function() {
            return $('.weekend-incident').hasClass('hidden');
          }
        };
        // Define all the blockages:
        var shoulder, oneLane, twoLane, threeLane, fourLane;
        // Run through each segment and through each peak to
        // get all the number of managed incidents and sum it up.
        _.each( segments, function( segment ) {
          _.each( peaks, function( peak ) {
            // Add only visible peaks
            if( ! visiblePeak[peak]() ) {
              shoulder = segment.get( peak + 'ShoulderBlockageManIndt' );
              oneLane = segment.get( peak + 'OneLaneBlockageManIndt' );
              twoLane = segment.get( peak + 'TwoLaneBlockageManIndt' );
              threeLane = segment.get( peak + 'ThreeLaneBlockageManIndt' );
              fourLane = segment.get( peak + 'FourLaneBlockageManIndt' );
              // Add the total for each lane
              total += shoulder + oneLane + twoLane + threeLane + fourLane;
            }
          });
        });

        var numOfIncidentsOnProgramRoadway = Number( project.get('numOfIncidentsOnProgramRoadway') );
        var studyPeriod = Number( project.get('studyPeriodDuration') ) / 12 ;
        var incidentsPerPeriod = numOfIncidentsOnProgramRoadway * studyPeriod;
        var valid = Number(total) === Math.floor(incidentsPerPeriod);

        if( valid ) {
          $('.managed-incidents-insufficient').hide(0);
        } else {
          $('.managed-incidents-insufficient').show(0);
        }

        return valid;
      };

      // This validates the Incident Information Panel, validating
      // all peaks, percentage of secondary incidents, and the number
      // of managed incidents. Its parameter "project" takes in the 
      // project model itself because there are validations that requires
      // the project level user input e.g. "Number of Annual Incidents on Program Roadway"
      this.validateIncidentInformation = function( project ) {
        // Validation each part of the Incident Information panel
        var peaksValid = this.validateIncidentDurationPeaks();
        var percentValid = this.validateSecondaryPercentage( $('#secondary_incidents_percentage').val() );

        // REMOVED TOTAL MANAGED INCIDENTS == ANNUAL INCIDENTS ON PROGRAM ROADWAYS VALIDATION
        //var incidentsValid = this.validateNumberOfIncident( project.get('numOfIncidentsOnProgramRoadway'), project.get('segments') );
        //var incidentsValid = this.validationTotalOfManagedIncidents( project );

        // Count the number of segments we have
        var segmentCount = project.get('segments').length;
        // If we have more than 1 segment validation for Managed Incidents will be
        // done on the SPP Output View.
        if( segmentCount > 1 ) {
          incidentsValid = true;
        }
        
        // Check the validity of all parts of the panel
        if( peaksValid && percentValid/* && incidentsValid */) {
          // This will turn the primary panel "Incident Information"
          // into green which means all the inputs in the panel are valid.
          $('#incident_information')
            .removeClass('panel-info')
            .addClass('panel-success')
            .find('.information-correct')
            .removeClass('hidden');
          // Since our Managed Incidents are valid, it is only
          // proper that we hide the warning note saying it's invalid
          // $('.managed-incidents-insufficient').hide(0);
        } else {
          // If either of the peaks, secondary incidents, or the
          // total of Managed Incidents is invalid then the primary
          // panel "Incident Information" is not valid.
          $('#incident_information')
            .removeClass('panel-success')
            .addClass('panel-info')
            .find('.information-correct')
            .addClass('hidden');
            // As long as the total number of 
            // if( incidentsValid === true ) {
            //   $('.managed-incidents-insufficient').hide(0);
            // } else {
            //   $('.managed-incidents-insufficient').show(0);
            // }
        }

        // Validate total of all managed incidents within all segments:
        //this.validationTotalOfManagedIncidents( project );

        return this;
      }

      this.validateNumber = function( value ) {
        return Number( value ) >= 0;
      };

      return this;

		};// End of CTRL

		return SegmentValidateCTRL;

});