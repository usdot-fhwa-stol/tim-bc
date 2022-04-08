/* globals define, GlobalEvent */

'use strict';

define([
  'backbone',
  'models/Segment',
  'text!partials/SegmentInfo.html',
  'text!resource/regions.json',
  'resource/ProjectTemplates',
  'utilities/template',
  'controllers/SegmentValidateCTRL'
  ], function( Backbone, Segment, SegmentInfoHTML, Regions, ProjectTemplates, template, SegmentValidateCTRL ) {

    var SegmentInfo = Backbone.View.extend({

      el : '#container',

      template : template( SegmentInfoHTML ),

      initialize : function() {
        //initialize weather information row count
        this.weatherInfoRows = 1;
        this.weatherRows = [];
        if(this.model.get('segments') != undefined ) {
          this.currentSegment = this.model.get('segments')[0];
        } else {
          this.currentSegment = null;
        }

        this.validateCTRL = new SegmentValidateCTRL();
        // ensure segment info view renders on duplication or
        // removal of segments using segment manager view
        GlobalEvent.on('segments:changed', this.render, this);

      },

      events : {
        // Changes current segment
        'change #select_segments': 'changeCurrentSegment',
        // ROADWAY GEOMETRY LISTENERS:
        //'blur #roadway_geometry input[type="text"]': 'validateRoadwayGeometry',
        //'click .operation-time button': 'toggleOperationTime',
        'click .operation-time': 'toggleOperationTime',
        'click #avg_duration_btn':  'toggleAvgDuration',
        'click #lane_blockage_btn': 'toggleLaneBlockage',
        'click .add-weather-info': 'addWeatherInfo',
        'click .undo-row': 'undoWeatherInfoRow',
        'click .reset-segment-info': 'resetSegmentInfo',
        //Input events: 
        'click .segment-info-helper': 'clearEvent',
        // GATHERING SEGMENT INFO INPUTS EVENTS
        'change #segment_name': 'updateSegmentName',
        'change #regions_by_state': 'updateRegions',
        'change #segment_length': 'updateSegmentLength',
        'change #number_of_ramps': 'updateNumberOfRamps',
        'change #num_of_traffic_lanes': 'updateNumberOfLanesByDirection',
        'change #general_terrain': 'updateGeneralTerrain',
        'change #horizontal_curvature': 'updateHorizontalCurvature',
        'change #avg_duration_savings': 'updateAvgDurationSavings',
        'change .lane-savings': 'updateLaneSavings',
        'change .num-of-managed-incidents': 'updateNumOfManagedIncidents',
        'change .avg-incident-duration': 'updateAvgIncidentDuration',
        'change #mainlane_speed_limit': 'updateSpeedLimit',
        'change .traffic-volume': 'updateTrafficVolume',
        'change .truck-percentage': 'updateTruckPercentage',
        'change #secondary_incidents_percentage': 'updateSecondaryIncidents',
        // WEATHER
        'change #weatherInformation .weather': 'saveWeatherType',
        'change #weatherInformation .percentage': 'saveWeatherPercentage',
        'click .calculate-ratio': 'calculateRatio',
        'change #shortenedDuration': 'drl_validateDRL',
        'change #proportion': 'drl_validateDRL',
        'change #complianceBefore': 'drl_validateDRL',
        'change #complianceAfter': 'drl_validateDRL'
      },

      drl_validateDRL : function( evnt ) {
        var _this = this;
        // create our html element object
        var item = {}
        // get the element using jquery
        item.element = $( evnt.currentTarget );
        // get the id of the element
        item.id = item.element.attr('id');
        item.modelValue = _this.currentSegment.get( item.id );
        item.value = function( value ) {
          if( value != undefined ) {
            this.element.val( value );
          }
          return this.element.val();
        };
        // validate the user input if it's a number
        var validInput = _this.validateCTRL.validateNumber( item.value() );
        // check if valid input and value is within range
        if( validInput ) {
          switch( item.id ) {
            case 'shortenedDuration':
              var segment = _this.currentSegment;
              var peaks = ['amPeak','pmPeak','weekdayOffPeak','weekend'];
              var blockages = ['Shoulder','OneLane','TwoLane','ThreeLane','FourLane'];
              var durationErr = 0; // this will count all our errors, valid should be 0

              if( item.value() > 0 ) {
                _.each( peaks, function( peak ) {
                  _.each( blockages, function( blockage ) {
                    var totalDuration = parseInt( item.value() ) + parseInt(segment.get( peak + blockage + 'BlockageAVGID'));
                    if( totalDuration > 240 ) {
                      durationErr++;
                    }
                  })
                })
              } else {
                durationErr++;
              }

              if( durationErr === 0 ) {
                _this.currentSegment.set( item.id, Number( item.value() ));
              } else {
                item.element.focus();
                alert('Error: Average Shortened Duration should be a number between 1 - 240.\n\n Note: Average Shortened Duration will be added to each Average Incident Duration during calculations, and any sum should not exceed 240.');
                item.value( item.modelValue );
              }
              break;
            case 'proportion':
              if( item.value() <= 100 && item.value() >= 0 ) {
                _this.currentSegment.set( item.id, Number( item.value() ));
              } else {
                item.element.focus();
                alert('Error: Proportion should be a number between 0 - 100.');
                item.value( item.modelValue );
              }
              break;
            case 'complianceBefore':
              if( item.value() <= 100 && item.value() >= 0 ) {
                _this.currentSegment.set( item.id, Number( item.value() ));
              } else {
                item.element.focus();
                alert('Error: Compliance Before should be a number between 0 - 100.');
                item.value( item.modelValue );
              }
              break;
            case 'complianceAfter':
              if( item.value() <= 100 && item.value() >= 0 ) {
                _this.currentSegment.set( item.id, Number( item.value() ));
              } else {
                item.element.focus();
                alert('Error: Compliance After should be a number between 0 - 100.');
                item.value( item.modelValue );
              }
              break;
          }
        } else {
          item.element.focus();
          alert('Error: Input requires a number.');
          item.value( item.modelValue );
        }

        return this;
      },

      validateSegment : function() {

        if( !!this.currentSegment ) {
          console.log('Segment Validated');
          var panels = $('.main-panel');
          var hasErrors = [];
          _.each( panels, function( panel ) {
            if( ! $(panel).hasClass('panel-success') ) {
              hasErrors.push(panel);
            }
          });

          // check for Region validity
          var region = $('#regions_by_state');
          if( region.val() == 'Select Region' || region.val() == '' ) {
            hasErrors.push( region );
            region.parent().addClass('has-error');
          } else {
            region.parent().removeClass('has-error');
          }

          // check for errors
          if( hasErrors.length > 0 ) {
            this.currentSegment.set('valid', false);
          } else {
            this.currentSegment.set('valid', true);
          }
        }

        return this;
      },

      /*******************************************************/

      clearEvent: function( evnt ) {
        if( typeof evnt == 'object' ) {
          evnt.preventDefault();
        }
        
        return this;
      },

      filterKeypress: function( evnt ) {
        return (evnt.which !== 0 && (evnt.charCode !== 0 || evnt.keyCode !== 0) && !evnt.ctrlKey && !evnt.metaKey && !evnt.altKey);
      },

      calculateRatio: function( evnt ) {
        this.clearEvent( evnt );

        // var valid = this.validateCTRL.validateTrafficInfo();

        // if( valid ) {
        //   GlobalEvent.trigger('project:output');
        // }
        this.validateSegment();
        // Reset the current segment since we're transitioning
        // to a different view
        this.currentSegment = undefined;
        GlobalEvent.trigger('project:output');

        return this;
      },

      // GATHERING SEGMENT INFO INPUT FUNCTIONS
      // Segment Name
      updateSegmentName: function( evnt ) {
        var value = evnt.currentTarget.value;
        this.currentSegment.set('name', value);

        return this;
      },
      // Regions by State
      updateRegions: function( evnt ) {
        var value = evnt.currentTarget.value;
        this.currentSegment.set('region', value);

        return this;
      },
      // Segment Length in miles
      updateSegmentLength: function( evnt ) {
        var _this = this;

        if( _this.filterKeypress( evnt ) ) {
          var $el = $(evnt.currentTarget);
          var value = Number( $el.val() );
          if( value > 0 ) {
            _this.currentSegment.set('segmentLength', value);
            $el.parent().removeClass('has-error');
          } else {
            $el.val(0).parent().addClass('has-error');
            _this.currentSegment.set('segmentLength', 0);
          }
        }
        
        _this.validateCTRL.validateRoadwayGeometry();

        return this;
      },
      // Number of Ramps
      updateNumberOfRamps: function( evnt ) {
        var _this = this;
        var target = evnt.currentTarget;
        var value = Number( target.value );
        // If not a number change to zero
        //value = ( isNaN(value) ) ? 0 : value;
        if( isNaN( value ) ) {
          alert('Roadway Geometry Error: Number of Ramps should be a number not less than 0 (Zero).');
          value = 0;
        }
        target.value = value;
        // Save value to segment model
        _this.currentSegment.set('numberOfRamps', value);
        // Validate Roadway Geometry Panel
        _this.validateCTRL.validateRoadwayGeometry();
        
        return this;
      },
      // Number of Lanes by Direction
      updateNumberOfLanesByDirection: function( evnt ) {
        var _this = this;

        var prevNum = _this.currentSegment.get('numberOfTrafficLanesByDirection');
        var value = Number( evnt.currentTarget.value ).round(0);

        if( isNaN( value ) || value < 2 || value > 6 ) {
          alert('Error: Number of traffic lanes should be a number from 2 to 6 only.')
          evnt.currentTarget.value = prevNum;
        } else {
          var resp = window.confirm('Changing the number of lanes will reset all values in the Incident Information panel to zero. It will also reset any incident duration savings entered by lane blocakge. Continue?');
          if( resp ) {
            evnt.currentTarget.value = value;
            _this.updateShoulderBlockage( value );
            _this.currentSegment.set('numberOfTrafficLanesByDirection', value);
            _this.validateCTRL.validateIncidentInformation( this.model );
            _this.validateCTRL.validateProgramInformation( _this.currentSegment );
          } else {
            evnt.currentTarget.value = prevNum;
          }
        }


        // } else {
        //   evnt.currentTarget.value = this.currentSegment.get('numberOfTrafficLanesByDirection');
        // }

        return this;
      },
      // General Terrain
      updateGeneralTerrain: function( evnt ) {
        var value = evnt.currentTarget.value;
        this.currentSegment.set('generalTerrain', value);

        return this;
      },
      // Horizontal Curvature
      updateHorizontalCurvature: function( evnt ) {
        var value = evnt.currentTarget.value;
        this.currentSegment.set('horizontalCurvature', value);

        return this;
      },
      // Operation Time
      updateOperationTime: function( checkbox ) {
        var _this = this;
        var checked = (checkbox.checked) ? 'checked' : '';
        var visibility = (checkbox.checked) ? 'visible' : 'hidden';
        var model =  $(checkbox).data('model');

        var peaks = {
          "amPeak": function() {
            _this.currentSegment.set('amPeakChecked', checked);
            _this.currentSegment.set('amPeakVisibility', visibility);
            return 'amPeak';
          },
          "pmPeak": function() {
            _this.currentSegment.set('pmPeakChecked', checked);
            _this.currentSegment.set('pmPeakVisibility', visibility);
            return 'pmPeak';
          },
          "weekdayOffPeak": function() {
            _this.currentSegment.set('weekdayOffPeakChecked', checked);
            _this.currentSegment.set('weekdayOffPeakVisibility', visibility);
            return 'weekdayOffPeak';
          },
          "weekend": function() {
            _this.currentSegment.set('weekendChecked', checked);
            _this.currentSegment.set('weekendVisibility', visibility);
            return 'weekend';
          }
        };

        peaks[model]();

        return this;
      },

      updateAvgDurationSavings: function( evnt ) {
        var _this = this;
        _this.clearEvent( evnt );
        var value = Number( evnt.currentTarget.value );
        if( value >= 0 ) {
          $('#avg_duration_container').removeClass('has-error');
          $('#savings_error').html('');
        } else {
          value = 0;
          evnt.currentTarget.value = value;
          $('#avg_duration_container').addClass('has-error');
          $('#savings_error').html('<p style="margin-top: 10px;">Please enter a number greater than 0.</p>');
        }

        _this.currentSegment.set('averageDurationSavings', value );
        _this.validateCTRL.validateProgramInformation( _this.currentSegment );

        return _this;
      },

      validateLaneSavings: function() {
        var laneSavings = $('.lane-savings');
        var invalid = 0;
        _.each( laneSavings, function( laneSaving ) {
          var value = $(laneSaving).val();
          var $container = $(laneSaving).closest('.lane-savings-container');
          if( value > 0 ) {
            $container.removeClass('has-error');
          } else {
            $container.addClass('has-error');
            invalid++;
          }
        });

        return invalid === 0;
      },

      // Lane Savings
      updateLaneSavings: function( evnt ) {
        var _this = this;
        _this.clearEvent( evnt );
        var $element = $( evnt.currentTarget );
        var key = $element.data('key');
        var value = $element.val();

        if( value >= 0 ) {
          _this.currentSegment.set( key, Number( value ) );
          this.validateCTRL.validateProgramInformation( this.currentSegment );
        } else {
          $element.val(0);
          //$('#savings_error').html('<br><p style="margin-top: 10px;">Please enter a number greater than 0.</p>');
        }

        //if( _this.validateLaneSavings() ) $('#savings_error').html('');

        return this;
      },

      updateAvgIncidentDuration: function( evnt ) {
        this.clearEvent( evnt );
        var $el = $( evnt.currentTarget );
        var peak = $el.data('peak');
        var lane = $el.data('lane');
        var value = Number($el.val());
        var valid = this.validateCTRL.validateNumber( value );
        var err = this.validateCTRL.validateAvgIncidentDuration();

        if( valid ) {
          if( value > 240 ) {
            alert('Average Incident Duration Error: Should not exceed 240.\nPrevious valid value will be reloaded.');
            $el.val( this.currentSegment.get(peak + lane + 'BlockageAVGID') );
          } else {
            this.currentSegment.set( peak + lane + 'BlockageAVGID', value );
          }
        } else {
          //alert('Average Incident Duration Error: Not a number!\nPrevious valid value will be reloaded.');
          $el.val( this.currentSegment.get(peak + lane + 'BlockageAVGID') );
        }

        this.validateCTRL.validateIncidentInformation( this.model );
        this.validateCTRL.validateProgramInformation( this.currentSegment );
        
        return this;
      },

      updateNumOfManagedIncidents: function( evnt ) {
        var _this = this;
        _this.clearEvent( evnt );
        var $el = $( evnt.currentTarget );
        var peak = $el.data('peak');
        var lane = $el.data('lane');
        var value = Number($el.val());
        var valid = this.validateCTRL.validateNumber( value );
        
        if( valid ) {
          this.currentSegment.set( peak + lane + 'BlockageManIndt', value );
        } else {
          $el.val(this.currentSegment.get(peak + lane + 'BlockageManIndt') );
        }

        this.validateCTRL.validateIncidentInformation( this.model );

        return this;
      },

      updateSpeedLimit: function( evnt ) {
        this.clearEvent( evnt );
        var value = evnt.currentTarget.value;
        var valid = this.validateCTRL.validateSpeedLimit();

        if( ! valid ) {
          alert('Error: Should not be 0.');
        }
        this.currentSegment.set('mainLaneSpeedLimit', Number( value ));
        this.validateCTRL.validateTrafficInfo();
        
        return this;
      },

      updateTrafficVolume: function( evnt ) {
        var _this = this;
        _this.clearEvent( evnt );
        var $el = $(evnt.currentTarget);
        var peak = $el.data('peak');
        var valid = _this.validateCTRL.validateTrafficVolume( $el.val() );
        var value = 0;
        
        if( valid ) {
          value = Number(evnt.currentTarget.value);
          $el.parent().removeClass('has-error');
        } else {
          $el.val(0).parent().addClass('has-error');
          alert('Error: Traffic Volume should be a number between 500 - 2200.');
        }

        _this.currentSegment.set( peak + 'TrafficVolume', value );
        _this.validateCTRL.validateTrafficInfo();
        
        return this;
      },

      updateTruckPercentage: function( evnt ) {
        this.clearEvent( evnt );
        var peak = $(evnt.currentTarget).data('peak');
        var valid = this.validateCTRL.validateTruckPercentage( evnt );
        if( valid ) {
          this.currentSegment.set( peak + 'TruckPercentage', Number(evnt.currentTarget.value) );
        } else {
          alert('Error: Truck Percentage input should be a number between 0 - 25.');
          evnt.currentTarget.value = 0;
        }

        this.validateCTRL.validateTrafficInfo();

        return this;
      },

      updateSecondaryIncidents: function( evnt ) {
        this.clearEvent( evnt );
        var valid = this.validateCTRL.validateSecondaryPercentage( evnt.currentTarget.value );
        if( valid ) {
          this.currentSegment.set('secondaryIncidentsPercentage', Number( evnt.currentTarget.value ));
        } else {
          alert('Error: Secondary Percentage should be a number between 0 - 100');
          evnt.currentTarget.value = this.currentSegment.get('secondaryIncidentsPercentage');
        }

        this.validateCTRL.validateIncidentInformation( this.model );
        
        return this;
      },

      /******************************************************/
      /**** LEFT PANEL FUNCTIONS
      /******************************************************/
      resetBlockages: function( segment ) {
        var peaks = ['amPeak','pmPeak','weekdayOffPeak','weekend'];
        var blockages = ['Shoulder','OneLane','TwoLane','ThreeLane','FourLane'];
        _.each(peaks, function( peak ) {
          _.each(blockages, function( blockage ) {
            segment.set(peak + blockage + 'BlockageAVGID', 0);
            segment.set(peak + blockage + 'BlockageManIndt', 0);
          });
        });

        segment.set('shoulderBlockageSavings', 0);
        segment.set('oneLaneBlockageSavings', 0);
        segment.set('twoLaneBlockageSavings', 0);
        segment.set('threeLaneBlockageSavings', 0);
        segment.set('fourLaneBlockageSavings', 0);

        return this;
      },
      // This is triggered by Number of Traffic lanes by direction:
      updateShoulderBlockage: function( evnt ) {
        this.clearEvent( evnt );
        var _this = this;
        var element = '#num_of_traffic_lanes';

        var numberOfLanes;
        if( typeof evnt == 'number' ) {
          numberOfLanes = evnt;
        } else {
          numberOfLanes = parseInt(evnt.currentTarget.value);
        }

        if( numberOfLanes >= 2 && numberOfLanes < 7 ) {
          _this.resetBlockages( _this.currentSegment );
          _this.appendPeakRows( numberOfLanes );
          _this.appendLaneSaving( numberOfLanes );
        } else {
          alert('NUMBER OF TRAFFIC LANES BY DIRECTION should be from 2 - 6 only!');
          $(element).val( 2 );
          _this.resetBlockages( _this.currentSegment );
          _this.updateShoulderBlockage( 2 );
          $(element).focus();
          return false;
        }

        return this;
      },

      // Get segment name
      saveSegmentName: function( evnt ) {
        this.currentSegment.attributes.name = evnt.value;
        return this;
      },

      /******************************************************/
      /**** MIDDLE PANEL FUNCTIONS
      /******************************************************/

      // This resets the traffic volume and the truck
      // percentage when unchecking operation time
      resetPeakData: function( peak ) {
        var _this = this;
        var reset = {
          //--
          'am-peak': function() {
            var amPeak = {
              trafficVolume: 0,
              truckPercentage: 0
            };
            _this.currentSegment.attributes.trafficInfo.amPeak = amPeak;
          },
          'pm-peak': function() {
            var pmPeak = {
              trafficVolume: 0,
              truckPercentage: 0
            };
            _this.currentSegment.attributes.trafficInfo.pmPeak = pmPeak;
          },
          'off-peak': function() {
            var weekdayOffPeak = {
              trafficVolume: 0,
              truckPercentage: 0
            };
            _this.currentSegment.attributes.trafficInfo.weekdayOffPeak = weekdayOffPeak;
          },
          'weekend': function() {
            var weekend = {
              trafficVolume: 0,
              truckPercentage: 0
            };
            _this.currentSegment.attributes.trafficInfo.weekend = weekend;
          },
          //--
        };

        reset[peak]();

        return this;
      },

      toggleOperationTime: function( evnt ) {
        // Cache the currently clicked checkbox
        var checkbox = evnt.currentTarget;
        var dataPanel = $(checkbox).data('panel');
        // Incident Information Section
        var panel = '.' + dataPanel + '-incident';
        // Blockage Severity Table Row
        var bStr = '.' + dataPanel;

        if( checkbox.checked === true ) {
          $(panel).removeClass('hidden');
          $(bStr).removeClass('hidden');
          $(panel).addClass('visible');
          $(bStr).addClass('visible');
        } else {
          $(panel).addClass('hidden');
          $(bStr).addClass('hidden');
          $(panel).removeClass('visible');
          $(bStr).removeClass('visible');
          //this.resetPeakData( dataPanel );
        }

        this.updateOperationTime( checkbox );
        this.validateCTRL.validateProgramInformation( this.currentSegment );
        this.validateCTRL.validateIncidentInformation( this.model );
        this.validateCTRL.validateTrafficInfo( this.currentSegment );
        this.validateSegment();

        return this;
      },

      toggleAvgDuration : function( evnt ) {
        var _this = this;
        _this.clearEvent( evnt );
        var resp = window.confirm('This will reset ALL incident duration savings previously entered.  Continue?');
        if( resp ) {
          //this.toggleActive( $(e.target) );
          $('#avg_duration_btn').addClass('active');
          $('#lane_blockage_btn').removeClass('active');
          $('#avg_duration_container').removeClass('hidden');
          $('#lane_blockage_savings').addClass('hidden');
          this.currentSegment.set('averageDurationActive', 'active');
          this.currentSegment.set('shoulderBlockageSavings', 0);
          this.currentSegment.set('oneLaneBlockageSavings', 0);
          this.currentSegment.set('twoLaneBlockageSavings', 0);
          this.currentSegment.set('threeLaneBlockageSavings', 0);
          this.currentSegment.set('fourLaneBlockageSavings', 0);
          $('.lane-savings').val(0);
          // Validate the SSP Program Information Panel
          _this.validateCTRL.validateProgramInformation( _this.currentSegment );
        }
        return this;
      },

      toggleLaneBlockage : function( evnt ) {
        var _this = this;
        if( evnt === true ) {
          $('#avg_duration_btn').removeClass('active');
          $('#lane_blockage_btn').addClass('active');
          $('#lane_blockage_savings').removeClass('hidden');
          $('#avg_duration_container').addClass('hidden');
        } else {
          _this.clearEvent( evnt );
          var resp = window.confirm('This will reset ALL incident duration savings previously entered.  Continue?');
          if( resp ) {

            $('#avg_duration_container').removeClass('has-error');
            $('#savings_error').html('');

            $('#avg_duration_btn').removeClass('active');
            $('#lane_blockage_btn').addClass('active');
            $('#lane_blockage_savings').removeClass('hidden');
            $('#avg_duration_container').addClass('hidden');
            _this.currentSegment.set('averageDurationActive', 'hidden');
            _this.currentSegment.set('averageDurationSavings', 0);
            $('#avg_duration_savings').val(0);
            // Validate the SSP Program Information Panel
            _this.validateCTRL.validateProgramInformation( _this.currentSegment );
          }
        }

        return this;
      },

      toggleActive: function( element ) {
        element.siblings().removeClass('active');
        if( ! element.hasClass('active') ) {
          element.addClass('active');
        }
      },

      toggleIncidentInfo: function() {

      },

      addWeatherInfo: function( evnt ) {
        this.clearEvent( evnt );
        var _this = this;
        //increase row count
        if( _this.weatherInfoRows < 7 ) {
          _this.weatherInfoRows++;
          _this.currentSegment.set('weatherRows', _this.weatherInfoRows);

          var weatherShow = {
            2: function() {
              _this.currentSegment.set('secondWeatherState', 'visible');
              $('#secondWeather').removeClass('hidden').addClass('visible');
              _this.weatherRows.push($('#secondWeather'));
            },
            3: function() {
              _this.currentSegment.set('thirdWeatherState', 'visible');
              $('#thirdWeather').removeClass('hidden').addClass('visible');
              _this.weatherRows.push($('#thirdWeather'));
            },
            4: function() {
              _this.currentSegment.set('fourthWeatherState', 'visible');
              $('#fourthWeather').removeClass('hidden').addClass('visible');
              _this.weatherRows.push($('#fourthWeather'));
            },
            5: function() {
              _this.currentSegment.set('fifthWeatherState', 'visible');
              $('#fifthWeather').removeClass('hidden').addClass('visible');
              _this.weatherRows.push($('#fifthWeather'));
            },
            6: function() {
              _this.currentSegment.set('sixthWeatherState', 'visible');
              $('#sixthWeather').removeClass('hidden').addClass('visible');
              _this.weatherRows.push($('#sixthWeather'));
            },
            7: function() {
              _this.currentSegment.set('seventhWeatherState', 'visible');
              $('#seventhWeather').removeClass('hidden').addClass('visible');
              _this.weatherRows.push($('#seventhWeather'));
            }
          }

          weatherShow[ _this.weatherInfoRows ]();
          //toggle whether undo should show or not
          //only show when there are more than 1 row
          this.toggleWeatherInfoUndo();
        } else {
          alert('Error: Max Weather Types can\'t exceed 7.');
        }

        this.validateWeatherTypeReadOnly();
        this.validateCTRL.validateTrafficInfo(_this.currentSegment);

        return this;
      },

      undoWeatherInfoRow : function( evnt ) {
        var _this = this;
        _this.clearEvent( evnt );
        //remove last row

        var weatherHide = {
          2: function() {
            _this.currentSegment.set('secondWeatherState', 'hidden');
            $('#secondWeather').addClass('hidden').removeClass('visible');
            _this.weatherRows.pop($('#secondWeather'));
          },
          3: function() {
            _this.currentSegment.set('thirdWeatherState', 'hidden');
            $('#thirdWeather').addClass('hidden').removeClass('visible');
            _this.weatherRows.pop($('#thirdWeather'));
          },
          4: function() {
            _this.currentSegment.set('fourthWeatherState', 'hidden');
            $('#fourthWeather').addClass('hidden').removeClass('visible');
            _this.weatherRows.pop($('#fourthWeather'));
          },
          5: function() {
            _this.currentSegment.set('fifthWeatherState', 'hidden');
            $('#fifthWeather').addClass('hidden').removeClass('visible');
            _this.weatherRows.pop($('#fifthWeather'));
          },
          6: function() {
            _this.currentSegment.set('sixthWeatherState', 'hidden');
            $('#sixthWeather').addClass('hidden').removeClass('visible');
            _this.weatherRows.pop($('#sixthWeather'));
          },
          7: function() {
            _this.currentSegment.set('seventhWeatherState', 'hidden');
            $('#seventhWeather').addClass('hidden').removeClass('visible');
            _this.weatherRows.pop($('#seventhWeather'));
          }
        }

        weatherHide[ _this.weatherInfoRows ]();

        //reduce row count
        _this.weatherInfoRows--;
        _this.currentSegment.set('weatherRows', _this.weatherInfoRows);

        //toggle whether undo should show or not
        //only show when there are more than 1 row
        _this.toggleWeatherInfoUndo();

        _this.validateCTRL.validateTrafficInfo(_this.currentSegment);

        // Re-validation segment
        _this.validateSegment();
        
        return this;
      },

      toggleWeatherInfoUndo: function() {
        //check if there are more than 1 row
        //show undo if true, hide if false
        if( this.weatherInfoRows === 1 ) {
          $('.undo-row').addClass('hidden');
        } else {
          $('.undo-row').removeClass('hidden');
        }
      },

      // Alerts the user for any changes that may happen that
      // can cause losing segment data
      resetSegmentInfo: function( evnt ) {
        var _this = this;
        _this.clearEvent( evnt );
        if (window.confirm("This will delete current information for this segment. Continue?")) {
          var segments = _this.model.get('segments');
          var id = 0;
          _.each( segments, function( segment, index ) {
            if( segment.cid == _this.currentSegment.cid ) {
              segment = new Segment();
              _this.currentSegment = segment;
              segments[index] = _this.currentSegment;
              id = index + 1;
              return segment;
            }
          });
          _this.render( id, _this.currentSegment );
        }

        return this;
      },

      /******************************************************/
      /**** RIGHT PANEL FUNCTIONS
      /******************************************************/

      // Counts the number of rows in a table
      countCurrentLanes: function() {
        // Grab one table since all have the same row count
        var table = $('#am_peak_wrapper').find('table');
        var rows = $(table).find('.peak-row');
        return rows.length;
      },
      // This is a sub function for appendPeakRows()
      buildPeakValues: function( segment, string ) {
        return {
          peakName: string,
          shoulderBlockageAVGID: segment.get( string + 'ShoulderBlockageAVGID'),
          shoulderBlockageManIndt: segment.get( string + 'ShoulderBlockageManIndt'),
          firstBlockageAVGID: segment.get( string + 'OneLaneBlockageAVGID'),
          firstBlockageManIndt: segment.get( string + 'OneLaneBlockageManIndt'),
          secondBlockageAVGID: segment.get( string + 'TwoLaneBlockageAVGID'),
          secondBlockageManIndt: segment.get( string + 'TwoLaneBlockageManIndt'),
          thirdBlockageAVGID: segment.get( string + 'ThreeLaneBlockageAVGID'),
          thirdBlockageManIndt: segment.get( string + 'ThreeLaneBlockageManIndt'),
          fourthBlockageAVGID: segment.get( string + 'FourLaneBlockageAVGID'),
          fourthBlockageManIndt: segment.get( string + 'FourLaneBlockageManIndt')
        }
      },
      // This appends new rows based on num value
      // @param num should be a number from 3 - 6
      appendPeakRows: function( numLanes ) {
        var _this = this;
        var peaks = ['#am_peak_wrapper', '#pm_peak_wrapper', '#off_peak_wrapper', '#weekend_wrapper'];
        var newRows = ProjectTemplates.DefaultLaneBlockage;
        switch( numLanes ) {
          case 3:
            newRows += ProjectTemplates.TwoLaneBlockage;
            break;
          case 4:
            newRows += ProjectTemplates.TwoLaneBlockage;
            newRows += ProjectTemplates.ThreeLaneBlockage;
            break;
          case 5:
          case 6:
            newRows += ProjectTemplates.TwoLaneBlockage;
            newRows += ProjectTemplates.ThreeLaneBlockage;
            newRows += ProjectTemplates.FourLaneBlockage;
            break;
        }//- switch

        var tableBody, currentRows, template, peakValues;
        // Traverse each peak element
        _.each(peaks, function( peak ) {
          // Get table element
          tableBody = $( peak ).find('table')
                       .find('tbody');
          //currentRows = $( tableBody ).html();
          // Build HTML:
          template = _.template( newRows );
          // Build properties required
          if( peak == '#am_peak_wrapper' ) {
            peakValues = _this.buildPeakValues( _this.currentSegment, 'amPeak' );
          } else if( peak == '#pm_peak_wrapper' ) {
            peakValues = _this.buildPeakValues( _this.currentSegment, 'pmPeak' );
          } else if( peak == '#off_peak_wrapper' ) {
            peakValues = _this.buildPeakValues( _this.currentSegment, 'weekdayOffPeak' );
          } else if( peak == '#weekend_wrapper' ) {
            peakValues = _this.buildPeakValues( _this.currentSegment, 'weekend' );
          }// end if

          // Render HTML
          $( tableBody ).html( template( peakValues ) );

        });

        return this;
      },

      appendLaneSaving: function( numLanes ) {
        var _this = this;
        var html = ProjectTemplates.DefaultLaneSavings;
        var element = $('#lane_blockage_savings');
        var template;

        switch( numLanes ) {
          case 3:
            html += ProjectTemplates.TwoLaneSavings;
            break;
          case 4:
            html += ProjectTemplates.TwoLaneSavings;
            html += ProjectTemplates.ThreeLaneSavings;
            break;
          case 5:
          case 6:
            html += ProjectTemplates.TwoLaneSavings;
            html += ProjectTemplates.ThreeLaneSavings;
            html += ProjectTemplates.FourLaneSavings;
            break;
        }

        template = _.template( html );

        element.html( template( _this.currentSegment.toJSON() ) );

        return this;
      },

      saveWeatherType: function( evnt ) {
        var _this = this;
        _this.clearEvent( evnt );
        var el = evnt.currentTarget;
        var weather = $(el).closest('tr').attr('id');
        var value = $(el).val();

        _this.currentSegment.set(weather, value);
        _this.validateCTRL.validateWeatherType( evnt );
        _this.validateCTRL.validateTrafficInfo( _this.currentSegment );

        // Experimental, revalidate segment after checking all
        // other validations.
        _this.validateSegment();
        
        return this;
      },

      saveWeatherPercentage: function( evnt ) {
        var _this = this;
        _this.clearEvent( evnt );
        var el = evnt.currentTarget;
        var weather = $(el).closest('tr').attr('id');
        var value = Number($(el).val());

        _this.currentSegment.set(weather + 'Prcnt', value);
        _this.validateCTRL.validateWeatherPercentage( evnt );

        return this;
      },

      loadWeatherInfo: function() {
        var _this = this;

        $('#firstWeather').find('select').val( _this.currentSegment.get('firstWeather') );
        $('#secondWeather').find('select').val( _this.currentSegment.get('secondWeather') );
        $('#thirdWeather').find('select').val( _this.currentSegment.get('thirdWeather') );
        $('#fourthWeather').find('select').val( _this.currentSegment.get('fourthWeather') );
        $('#fifthWeather').find('select').val( _this.currentSegment.get('fifthWeather') );
        $('#sixthWeather').find('select').val( _this.currentSegment.get('sixthWeather') );
        $('#seventhWeather').find('select').val( _this.currentSegment.get('seventhWeather') );


        return this;
      },

      validateWeatherTypeReadOnly: function() {
        var trafficInfo = $('#traffic_information');
        var weatherTypes = $('.weather');
        var visibleWeather = [];
        var siblingPercent = null;

        _.each( weatherTypes, function( weatherType ) {
          if( $(weatherType).closest('tr').hasClass('visible') ) {
            visibleWeather.push( weatherType );
          }
        });

        _.each( visibleWeather, function( meta ) {
          if( $(meta).val() != 'Select Type' ) {
            siblingPercent = $(meta).closest('tr').find('.percentage');
            siblingPercent.prop('readonly', false);
          }
        });

        return this;
      },

      // FORM EVENTS:

      changeCurrentSegment: function( evnt ) {

        var currentSegment = parseInt( evnt.currentTarget.value );

        GlobalEvent.trigger('segment-change', { segment: currentSegment });

        return this;
      },

      loadModelValues: function( id ) {
        var numOfSegments = this.model.get('segments').length;
        var segments = this.model.get('segments');
        var segmentList = '';
        // Generate a list of segments according to the number of segments
        for (var i = 1; i <= numOfSegments; i++) {
          segmentList += '<option value="' + i + '">Segment ' + i + '</option>\n';
        };
        // Render the list to the DOM within #select_segments select element
        $('#select_segments').append( segmentList ).val( parseInt( id ));
        // Load General Terrain Value
        $('#general_terrain').val( this.currentSegment.get('generalTerrain') );
        $('#horizontal_curvature').val( this.currentSegment.get('horizontalCurvature') );
        $('#regions_by_state').val( this.currentSegment.get('region') );

        // Load weather values
        this.loadWeatherInfo();
        this.validateWeatherTypeReadOnly();
        this.toggleWeatherInfoUndo();

        if( this.currentSegment.get('averageDurationActive') == 'hidden' )
          this.toggleLaneBlockage( true );

        return this;
      },
      // @param id = segment id taken from route state
      render : function( id, segment ) {
        var _this = this;
        // check if a segment is passed as a parameter and assign
        // it as our current segment
        if( ! id && segment ) {
          _this.currentSegment = segment;
        // however, if an integer is passed as 'id', reduce this integer
        // by 1 and get the segment with this as our index from our
        // project's list of segments
        } else if( id ) {
          _this.currentSegment = _this.model.get('segments')[ id - 1 ];
        // if both id and segment are undefined, default to current segment
        // cached by our view, this normally occurs when a Global Event is triggered
        } else {
          _this.currentSegment = _this.currentSegment;
          // get our segments to get the index of the current segment
          var segments = this.model.get('segments');
          // get our current segment's index add it by 1 to create the id
          // for our segment list select box to render the view showing
          // the current segment
          id = segments.indexOf( _this.currentSegment ) + 1;
        }

        //$('.pm-peak-incident').hide(0);

        // Check if there is a project
        if( _this.model.get('projectName') !== '' ) {
          // Check if there is at least 1 segment
          if( _this.model.get('numOfSegments') === 0 ) {
            // Render err message for no segments
            _this.$el.html( ProjectTemplates.NoSegment );
          } else {
            // render template/partial:
            _this.$el.html( _this.template( _this.currentSegment.toJSON() ) ).trigger('change');
            // --
            // Load regions by state
            var regionsByState = JSON.parse( Regions );
            var regions = regionsByState[ _this.model.get('projectState') ];

            // This will load the regions by state
            var options = '<option value="Select Region">Select Region</option>';
            _.each(regions, function( region ) {
              options += '<option value="' + region + '">' + region + '</option>';
            });

            $('#regions_by_state').html( options );
            //--
            // Populate Model values:
            _this.weatherInfoRows = _this.currentSegment.get('weatherRows');
            _this.loadModelValues( id );
            _this.validateCTRL.validateCurrentSegment( _this.currentSegment );
            //_this.validateCTRL.validateIncidentInformation( _this.model );
            //--
            // Add project name:
            $('#project_name').text(_this.model.get('projectName'));
          }
          // --
        } else {
          // Render err message for no project
          _this.$el.html( ProjectTemplates.NoProject );
        }

        // Initialize Tooltips
        $('.segment-info-helper').tooltip();

        // Trigger sidebar active item
        GlobalEvent.trigger('sidebar-navigation', { item: 'project-segments-page' });

        // Run validations whenever segment is rendered..
        _this.validateCTRL.validateRoadwayGeometry();
        

        // Log Segment on render
        if( _this.currentSegment ) {
          // Reload Peak Rows based on saved Number of Lanes by Direction..
          _this.appendPeakRows( _this.currentSegment.get('numberOfTrafficLanesByDirection') );
          _this.appendLaneSaving( _this.currentSegment.get('numberOfTrafficLanesByDirection') );
          _this.validateCTRL.validateProgramInformation( _this.currentSegment );
          // Added 1/21/2015 Fix for validating Peaks' Incident Durations
          // This is a change related to the commented out Line: 933
          _this.validateCTRL.validateIncidentInformation( _this.model );

          // Log current Segment..
          console.log(_this.currentSegment);
        }



        /****
          Important: Validating Segment
          ****/
        _this.validateSegment();
        if( _this.currentSegment ) {
          var listened = 0;
          _.each( _this._listeningTo, function( listeners ) {
            if( _this.currentSegment.cid == listeners.cid ) {
              listened++;
            }
          });
          if( listened === 0 ) {
            _this.listenTo( _this.currentSegment, 'change', _this.validateSegment );
          }
        }
        /**********/

        return _this;
      }

    });

    return SegmentInfo;

  });
