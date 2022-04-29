/* globals define */

'use strict';

define([
  'backbone',
  'text!partials/SSPOutput.html',
  'utilities/template',
  'resource/ProjectTemplates',
  'controllers/SavingsCTRL',
  'controllers/SegmentValidateCTRL',
  'controllers/BenefitCostCTRL',
  'controllers/PDFMakeCTRL'
], function(Backbone, SSPOutputHTML, template, ProjectTemplates, SavingsCTRL, SegmentValidateCTRL, BenefitCostCTRL, PDFMakeCTRL) {


  var SSPOutputView = Backbone.View.extend({

    el: '#container',

    template: template( SSPOutputHTML ),

    initialize: function () {
      var _this = this;
      var segments = _this.model.get('segments');
      _.each( segments, function( segment ) {
        _this.listenTo( segment, 'change', _this.calculateTotalDelaySavings );
      });

      _this.listenTo( _this.model, 'change:numOfSegments',function() {
        var linkRef = $('.project-output-page');
        var active = linkRef.hasClass('active');
        if( active ) {
          _this.render();
        }
      });

      // Make PDF
      _this.sspPDF = PDFMakeCTRL;
    },

    events : {
      'click #select_all': 'selectAllSegments',
      'click #deselect_all': 'deselectAllSegments',
      'click .delete-segment': 'deleteSegment',
      'click .segment-checkbox': 'updateSegmentList',
      'click .savings-checkbox': 'calculateTotalDelaySavings',
      'click .produce-report': 'generateReport'
    },

    clearEvent: function( evnt ) {
      if( evnt ) {
        evnt.preventDefault();
      }

      return this;
    },

    selectAllSegments: function(evnt) {
      var _this = this;
      _this.clearEvent( evnt );
      var segments = _this.model.get('segments');
      _.each( segments, function( segment, index ) {
        _this.updateSegmentList( false, true, index );
      })
      $('.segment-checkbox').prop('checked', true);
      this.calculateTotalDelaySavings();
    },

    deselectAllSegments: function(evnt) {
      var _this = this;
      _this.clearEvent( evnt );
      var segments = _this.model.get('segments');
      _.each( segments, function( segment, index ) {
        _this.updateSegmentList( false, false, index );
      })
      $('.segment-checkbox').prop('checked', false);
      this.calculateTotalDelaySavings();
    },

    listAllSegments: function() {
      var _this = this;
      var segments = _this.model.get('segments'); // array of segments
      var segmentDetails, listTempalte, checked, html = '';
      listTempalte = _.template( ProjectTemplates.ListTemplate );

      _.each(segments, function( segment, index ) {
        if( segment.get('checked') ) {
          checked = 'checked';
        } else {
          checked = '';
        }
        // Use Segment Name or define a Segment Number
        segmentDetails = {
          segmentName: segment.get('name') || 'Segment ' + ( index + 1 ),
          segmentChecked: checked,
          index: index
        };

        html += listTempalte( segmentDetails );
        
        var studyPeriodDuration = parseInt( _this.model.get('studyPeriodDuration') );
        var annualStudyPD = studyPeriodDuration / 12;
        var numberOfIncidents = 0;

        var peaks = ['amPeak', 'pmPeak', 'weekdayOffPeak', 'weekend'];
        var blockages = ['ShoulderBlockage', 'OneLaneBlockage', 'TwoLaneBlockage', 'ThreeLaneBlockage', 'FourLaneBlockage'];

        _.each( segments, function( segment ) {
          _.each( peaks, function( peak ) {
            _.each( blockages, function( blockage ) {
              var incidents = parseInt( segment.get( peak + blockage + 'ManIndt' ) );
              numberOfIncidents += incidents;
            });
          });
        });

        _this.model.set('numOfIncidentsOnProgramRoadway', numberOfIncidents / annualStudyPD);

        if( segments.length > 1 ) {
          var segmentValidator = new SegmentValidateCTRL();
          var validateTotalManIncdnt = segmentValidator.validationTotalOfManagedIncidents( _this.model );
          if( ! validateTotalManIncdnt ) {
            $('.invalid-managed-incident-total').removeClass('hidden');
          } else {
            $('.invalid-managed-incident-total').addClass('hidden');
          }
        }

      });

      $('#segment_list').html( html );
      var labels = $('.segment-name');
      var checkboxes = $('.segment-checkbox');
      var invalidSegments = [];
      _.each( segments, function( segment, index ) {
        if( ! segment.get('valid') ) {
          invalidSegments.push(checkboxes[index]);
          $(checkboxes[index])
            .prop('disabled', true)
            .parent().addClass('disabled');
          $(labels[index]).addClass('text-danger');
        } else {
          $(checkboxes[index])
            .prop('disabled', false)
            .parent().removeClass('disabled');
          $(labels[index]).removeClass('text-danger');
        }
      });

      if( invalidSegments.length > 0 ) {
        $('.invalid-segment-message').removeClass('hidden');
      } else {
        $('.invalid-segment-message').addClass('hidden');
      }


    },

    updateSegmentList: function( evnt, checked, segmentID ) {
      if( evnt ) {
        var $element = $( evnt.currentTarget );
        segmentID = $element.data('index');
        checked = $element.prop('checked');
      }
      var segment = this.model.get('segments')[segmentID];
      // Save state of checkbox for the segment
      if( checked === true ) {
        segment.set('checked', 'checked');
      } else {
        segment.set('checked', false);
      }
      // Recalculate delay savings
      this.calculateTotalDelaySavings();

      return this;
    },

    calculateSegmentDelaySavings: function( evnt ) {
      var _this = this;
      _this.clearEvent( evnt );
      var formulaCTRL = new SavingsCTRL();
      var projectState = _this.model.get('projectState');
      var userPeakSavings, computedPeakSavings, driverWage;
      //Added by Fang Zhou for adding Monetary conversion rates table on 09/14/2015
      var fuelPrice;
      //Added end for adding Monetary conversion rates table on 09/14/2015

      var segments = _this.model.get('segments');

      _.each( segments, function( segment ) {
        var totalSegmentSaving = 0;
        var totalSegmentSavingCar = 0;
        var totalSegmentSavingTruck = 0;
        var totalSegmentSecondaryIncidents = 0;
        var totalSegmentSecondaryIncidentsSavings = 0;
        var totalSegmentSecondaryIncidentsWithoutTIM = 0;
        var totalTravelDelayWithTIM = 0;
        var totalTravelDelayWithoutTIM = 0;

        var totalFuelConsumptionGallons = 0;
        var totalFuelSavings = 0;
        var totalFuelSavingsGallons = 0;
        var totalTravelDelay = 0;
        var totalTravelDelayWithoutSSP = 0;

        var totalCOEmission = 0,
          totalCO2Emission = 0,
          totalHCEmission = 0,
          totalNOxEmission = 0,
          totalSOxEmission = 0;

        // gather and calculate the bare user input
        userPeakSavings = formulaCTRL.calculateDelaySavings( segment, _this.model.get('projectState') );
        // similar to the userPeakSavings except we apply DRL calculations
        computedPeakSavings = formulaCTRL.calculateDelaySavings( segment, _this.model.get('projectState'), true );
        // get the driver wage based on the segment's state or region
        driverWage = formulaCTRL.getDriverWage( projectState, segment.get('region') );
        //Added by Fang Zhou for adding Monetary conversion rates table on 09/14/2015
        fuelPrice = formulaCTRL.getFuelCost(projectState);
        //Added end for adding Monetary conversion rates table on 09/14/2015

        // get the total values with the DRL calculations
        _.each( computedPeakSavings, function( peakSaving ) {
          totalSegmentSaving += peakSaving.totalPeakSavings.totalPeakTravelDelaySavings;
          totalSegmentSavingCar += peakSaving.totalPeakSavings.totalPeakTravelDelayCarSavings;
          totalSegmentSavingTruck += peakSaving.totalPeakSavings.totalPeakTravelDelayTruckSavings;

          totalFuelConsumptionGallons += peakSaving.totalFuelConsumptionGallons;
          totalFuelSavings += peakSaving.totalFuelSavings;
          totalFuelSavingsGallons += peakSaving.totalFuelSavingsGallons;

          // for secondary incidents
          totalTravelDelay += peakSaving.totalPeakSavings.totalTravelDelay;
          totalTravelDelayWithoutTIM += totalTravelDelay;
          // New Secondary Incidents Calculation
          if( ! isNaN(Number(peakSaving.totalPeakSavings.totalSecondaryIncidents)) ) {
            totalSegmentSecondaryIncidentsWithoutTIM += peakSaving.totalPeakSavings.totalSecondaryIncidents;
          }

          totalCOEmission += peakSaving.totalSegmentEmissions.COEmission;
          totalCO2Emission += peakSaving.totalSegmentEmissions.CO2Emission;
          totalHCEmission += peakSaving.totalSegmentEmissions.HCEmission;
          totalNOxEmission += peakSaving.totalSegmentEmissions.NOxEmission;
          totalSOxEmission += peakSaving.totalSegmentEmissions.SOxEmission;

        });

        // compute for secondary incident savings based on the totals
        // gathered from the DRL computed savings.
        var totalSegmentSecondaryIncidentsWithoutDRL = _this.getSecondaryIncidents( computedPeakSavings, userPeakSavings );
        var secondaryIncidentsSavings = totalSegmentSecondaryIncidentsWithoutDRL - totalSegmentSecondaryIncidentsWithoutTIM;
        totalSegmentSecondaryIncidentsSavings = secondaryIncidentsSavings * 4736;
        _.each( userPeakSavings, function( peakSaving ) {
          totalSegmentSaving -= peakSaving.totalPeakSavings.totalPeakTravelDelaySavings;
          totalSegmentSavingCar -= peakSaving.totalPeakSavings.totalPeakTravelDelayCarSavings;
          totalSegmentSavingTruck -= peakSaving.totalPeakSavings.totalPeakTravelDelayTruckSavings;

          totalFuelConsumptionGallons -= peakSaving.totalFuelConsumptionGallons;
          totalFuelSavings -= peakSaving.totalFuelSavings;
          totalFuelSavingsGallons -= peakSaving.totalFuelSavingsGallons;

          // for secondary incidents
          totalTravelDelay -= peakSaving.totalPeakSavings.totalTravelDelay;
          totalTravelDelayWithTIM += peakSaving.totalPeakSavings.totalTravelDelay;
          // New Secondary Incidents Calculation
          // if( ! isNaN(Number(peakSaving.totalPeakSavings.totalSecondaryIncidents)) ) {
          //   totalSegmentSecondaryIncidentsWithoutTIM -= peakSaving.totalPeakSavings.totalSecondaryIncidents;
          // }

          totalCOEmission -= peakSaving.totalSegmentEmissions.COEmission;
          totalCO2Emission -= peakSaving.totalSegmentEmissions.CO2Emission;
          totalHCEmission -= peakSaving.totalSegmentEmissions.HCEmission;
          totalNOxEmission -= peakSaving.totalSegmentEmissions.NOxEmission;
          totalSOxEmission -= peakSaving.totalSegmentEmissions.SOxEmission;

        });

        segment.set('sumOfAllTravelDelays', totalTravelDelay);

        segment.set('totalSegmentSaving', totalSegmentSaving);
        segment.set('totalSegmentSavingCar', totalSegmentSavingCar);
        segment.set('totalSegmentSavingTruck', totalSegmentSavingTruck);

        segment.set('totalFuelConsumptionGallons', totalFuelConsumptionGallons);
        segment.set('totalFuelSavings', totalFuelSavings);
        segment.set('totalFuelSavingsGallons', totalFuelSavingsGallons);
        
        segment.set('driverWage', driverWage);
        //Added by Fang Zhou for adding Monetary conversion rates table on 09/14/2015
        segment.set('fuelPrice', fuelPrice);
        //Added end for adding Monetary conversion rates table on 09/14/2015

        segment.set('totalSegmentSecondaryIncidents', secondaryIncidentsSavings);
        segment.set('totalSegmentSecondaryIncidentsSavings', totalSegmentSecondaryIncidentsSavings);

        segment.set('COEmission', totalCOEmission);
        segment.set('CO2Emission', totalCO2Emission);
        segment.set('HCEmission', totalHCEmission);
        segment.set('NOxEmission', totalNOxEmission);
        segment.set('SOxEmission', totalSOxEmission);
      });

      return this;
    },

    getSecondaryIncidents: function( arrPeaks1, arrPeaks2 ) {
      var secondaryIncidentsWithDRL = 0;
      var totalTravelDelay1 = 0;
      var totalTravelDelay2 = 0;

      for( var x = 0, len = arrPeaks1.length; x < len; x++ ) {
        var incidentsByWeather1 = arrPeaks1[x].incidentsByWeather;
        var incidentsByWeather2 = arrPeaks2[x].incidentsByWeather;

        for( var i = 0, len2 = incidentsByWeather1.length; i < len2; i++ ) {
          var blockage = incidentsByWeather1[i].blockage;
          if( blockage !== 'increasedShoulderBlockage') {
            totalTravelDelay1 += incidentsByWeather1[i].totalTravelDelayCarAndTruck;
            totalTravelDelay2 += incidentsByWeather2[i].totalTravelDelayCarAndTruck;
          } else {
            totalTravelDelay1 -= incidentsByWeather1[i].totalTravelDelayCarAndTruck;
            totalTravelDelay2 -= incidentsByWeather2[i].totalTravelDelayCarAndTruck;
          }
        }
      }

      for( var x = 0, len = arrPeaks1.length; x < len; x++ ) {
        var incidentsByWeather1 = arrPeaks1[x].incidentsByWeather;
        var incidentsByWeather2 = arrPeaks2[x].incidentsByWeather;
        // var totalTravelDelay1 = arrPeaks1[x].totalPeakSavings.totalTravelDelay;
        // var totalTravelDelay2 = arrPeaks2[x].totalPeakSavings.totalTravelDelay;

        for( var i = 0, len2 = incidentsByWeather1.length; i < len2; i++ ) {
          var secondaryIncidents1 = incidentsByWeather1[i].secondaryIncidentsWithoutTIM;
          var secondaryIncidents2 = totalTravelDelay1 / totalTravelDelay2 * secondaryIncidents1;
          secondaryIncidents2 = ( isNaN(secondaryIncidents2) ) ? 0 : secondaryIncidents2;

          secondaryIncidentsWithDRL += secondaryIncidents2;
        }

      }

      return secondaryIncidentsWithDRL;
    },

    calculateEmissions: function ( project ) {
      var _this = this;
      var savingsCTRL = new SavingsCTRL();
      project = project || _this.model;
      var segments = project.get('segments');
      var totalCOEmission = 0,
        totalCO2Emission = 0,
        totalHCEmission = 0,
        totalNOxEmission = 0,
        totalSOxEmission = 0;

      _.each(segments, function( segment ) {

        if( segment.get('checked') != false && segment.get('valid') != false ) {

          totalCOEmission += segment.get('COEmission'),
          totalCO2Emission += segment.get('CO2Emission'),
          totalHCEmission += segment.get('HCEmission'),
          totalNOxEmission += segment.get('NOxEmission'),
          totalSOxEmission += segment.get('SOxEmission');

        }

      });

      $('#cabon_monoxide').val( Number(totalCOEmission).round(2) );
      $('#carbon_dioxide').val( Number(totalCO2Emission).round(2) );
      $('#hydrocarbon').val( Number(totalHCEmission).round(2) );
      $('#nitrogen_oxide').val( Number(totalNOxEmission).round(2) );
      $('#sulfur_oxide').val( Number(totalSOxEmission).round(2) );

      
      project.set('totalCOEmission', totalCOEmission);
      project.set('totalCO2Emission', totalCO2Emission);
      project.set('totalHCEmission', totalHCEmission);
      project.set('totalNOxEmission', totalNOxEmission);
      project.set('totalSOxEmission', totalSOxEmission);
    },

    calculateTotalDelaySavings: function() {
      var _this = this;
      var segments = _this.model.get('segments');
      // Variables for computing the cost benefit ratio
      var annualCost = _this.model.get('totalProgramCost');
      var studyPeriodDuration = parseInt( _this.model.get('studyPeriodDuration') );
      var annualStudyPD = studyPeriodDuration / 12;
      var numberOfIncidents = 0;

      var peaks = ['amPeak', 'pmPeak', 'weekdayOffPeak', 'weekend'];
      var blockages = ['ShoulderBlockage', 'OneLaneBlockage', 'TwoLaneBlockage', 'ThreeLaneBlockage', 'FourLaneBlockage'];

      _.each( segments, function( segment ) {
        _.each( peaks, function( peak ) {
          _.each( blockages, function( blockage ) {
            var incidents = parseInt( segment.get( peak + blockage + 'ManIndt' ) );
            numberOfIncidents += incidents;
          });
        });
      });

      _this.model.set('numOfIncidentsOnProgramRoadway', numberOfIncidents / annualStudyPD);

      var benefitCostCTRL = new BenefitCostCTRL();
      
      var totalFuelSavingsMoney = benefitCostCTRL.calculateFuelSavings( segments );
      var totalFuelSavingsGallons = benefitCostCTRL.calculateFuelSavingsGallons( segments );

      $('#fuel').val( Number(totalFuelSavingsGallons).round(2) );
      $('#fuel_money').val( Number(totalFuelSavingsMoney).round(2) );

      var benefits = 0;
      var totalSavings = benefitCostCTRL.calculateProjectSavings( segments );
      // Calculate Secondary Incidents Savings
      var secondaryIncidentsSavings = benefitCostCTRL.calculateSecondaryIncidents( segments ) || 0;
      var roundedSecondaryIncidentsSavings = Number( secondaryIncidentsSavings ).round(2);
      if( isNaN( roundedSecondaryIncidentsSavings ) ) {
        secondaryIncidentsSavings = 0;
      }
      $('#secondary_accidents').val( Number( secondaryIncidentsSavings ).round(2) );
      $('#secondary_accidents_savings').val( Number( secondaryIncidentsSavings  * 4736).round(2) );

      // Check if delay savings checkbox is checked first
      if( $('#delay_savings_checkbox').prop('checked') ) {
        benefits += benefitCostCTRL.calculateBenefits( segments );
      }

      // Check if fuel checkbox is checked
      if( $('#fuel_checkbox').prop('checked') ) {
        benefits += totalFuelSavingsMoney;
      }

      // Check if its respective checkbox is checked first
      if( $('#secondary_accidents_checkbox').prop('checked') ) {
        benefits += secondaryIncidentsSavings * 4736;
      }

      var benefitCost = ( benefits / annualStudyPD) / annualCost;
      // this checks if benefit cost ration is not a number and converts it to zero
      if( ! isFinite(benefitCost) ) benefitCost = 0;
      $('#delay_savings').val( Number( (totalSavings) ).round(2) );
      $('#delay_savings_money').val( Number( benefitCostCTRL.calculateBenefits( segments ) ).round(2) );
      $('#total_benefits_money').val( Number( benefits ).round(2) );
      $('#total_cost_money').val( Number( annualCost ).round(2) );
      $('#benefit_cost_ratio').val( Number( benefitCost ).round(2) );

      _this.model.set('benefitCostRatio', benefitCost);
      _this.model.set('secondaryIncidents', secondaryIncidentsSavings);
      _this.model.set('secondaryIncidentsSavings', secondaryIncidentsSavings * 4736);

      _this.calculateEmissions( _this.model );

      return this;
    },

    deleteSegment: function(e) {
      e.preventDefault();
      var segment = $(e.currentTarget).data('segment');
      this.model.get('segments').splice( parseInt(segment), 1 );
      this.model.set('numOfSegments', this.model.get('segments').length);
      this.listAllSegments();
      this.calculateTotalDelaySavings();
    },

    renderSuccess: function() {
      // Callback when no errors are met
      
    },

    renderFail: function() {
      // Callback when errors are met
      
    },

    generateReport: function() {
      var _this = this;

      _this.sspPDF.generate( _this.model );

      return this;
    },

    render: function() {
      var _this = this;

      if( GlobalEvent._events.errorSpeed == undefined ) {
        GlobalEvent.once('errorSpeed', function( options ) {
          alert('Error: Unfortunately you entered an Invalid Speed in ' + options.name + '.\nPlease review each Segment\'s speed and correct their values.');
        });
      }

      // Check if there is a project
      if( _this.model.get('projectName') !== '') {
        // get all segments
        var segments = _this.model.get('segments');
        // Since we're listening to a change in the project model
        // this stops a bug when starting a new project.
        if( segments !== undefined ) {
        // Check if there is at least 1 segment
          if( _this.model.get('segments').length === 0 ) {
            _this.$el.html( ProjectTemplates.NoSegment );
          } else {
            // stop listening to the CHANGE event
            var invalidSegments = 0;
            _.each( segments, function( segment ) {
              segment.stopListening('change');
              if( segment.get('valid') != true ) invalidSegments++;
            });

            if( invalidSegments == 0 ) {
              GlobalEvent.trigger('link:enable', {
                link: '.project-output-page',
                enable: true
              });
            }

            _this.$el.html( _this.template(_this.model.toJSON()) ).trigger('change');
            // List segments
            _this.listAllSegments();
            _this.calculateSegmentDelaySavings();
            _this.calculateTotalDelaySavings();
          }
        }
        // --
      } else {
        _this.$el.html( ProjectTemplates.NoProject );
      }

      // Trigger sidebar active item
      GlobalEvent.trigger('sidebar-navigation', { item: 'project-output-page' });

    }

  });

  return SSPOutputView;

});