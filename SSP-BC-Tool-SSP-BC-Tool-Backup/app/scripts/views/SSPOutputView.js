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
      var checkboxes = $('.segment-checkbox');
      var invalidSegments = [];
      _.each( segments, function( segment, index ) {
        if( ! segment.get('valid') ) {
          invalidSegments.push(checkboxes[index]);
          $(checkboxes[index])
            .prop('disabled', true)
            .parent().addClass('disabled');
        } else {
          $(checkboxes[index])
            .prop('disabled', false)
            .parent().removeClass('disabled');
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
      var peakSavings, driverWage;

      var segments = _this.model.get('segments');

      _.each( segments, function( segment ) {
        var totalSegmentSaving = 0;
        var totalSegmentSavingCar = 0;
        var totalSegmentSavingTruck = 0;
        var totalSegmentSecondaryIncidents = 0;
        var totalSegmentSecondaryIncidentsSavings = 0;

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

        peakSavings = formulaCTRL.calculateDelaySavings( segment, _this.model.get('projectState') );
        driverWage = formulaCTRL.getDriverWage( projectState, segment.get('region') );

        _.each( peakSavings, function( peakSaving ) {
          totalSegmentSaving += peakSaving.totalPeakSavings.totalPeakTravelDelaySavings;
          totalSegmentSavingCar += peakSaving.totalPeakSavings.totalPeakTravelDelayCarSavings;
          totalSegmentSavingTruck += peakSaving.totalPeakSavings.totalPeakTravelDelayTruckSavings;

          totalFuelConsumptionGallons += peakSaving.totalFuelConsumptionGallons;
          totalFuelSavings += peakSaving.totalFuelSavings;
          totalFuelSavingsGallons += peakSaving.totalFuelSavingsGallons;

          // for secondary incidents
          totalTravelDelay += peakSaving.totalPeakSavings.totalTravelDelay;
          totalTravelDelayWithoutSSP += peakSaving.totalPeakSavings.totalTravelDelayWithoutSSP;

          // New Secondary Incidents Calculation
          if( ! isNaN(Number(peakSaving.totalPeakSavings.totalSecondaryIncidents)) ) {
            totalSegmentSecondaryIncidents += peakSaving.totalPeakSavings.totalSecondaryIncidents;
            totalSegmentSecondaryIncidentsSavings += peakSaving.totalPeakSavings.totalSecondaryIncidents * 4736;
          }

          totalCOEmission += peakSaving.totalSegmentEmissions.COEmission;
          totalCO2Emission += peakSaving.totalSegmentEmissions.CO2Emission;
          totalHCEmission += peakSaving.totalSegmentEmissions.HCEmission;
          totalNOxEmission += peakSaving.totalSegmentEmissions.NOxEmission;
          totalSOxEmission += peakSaving.totalSegmentEmissions.SOxEmission;

        });

        segment.set('sumOfAllTravelDelays', totalTravelDelayWithoutSSP - totalTravelDelay);

        segment.set('totalSegmentSaving', totalSegmentSaving);
        segment.set('totalSegmentSavingCar', totalSegmentSavingCar);
        segment.set('totalSegmentSavingTruck', totalSegmentSavingTruck);

        segment.set('totalFuelConsumptionGallons', totalFuelConsumptionGallons);
        segment.set('totalFuelSavings', totalFuelSavings);
        segment.set('totalFuelSavingsGallons', totalFuelSavingsGallons);
        
        segment.set('driverWage', driverWage);

        segment.set('totalSegmentSecondaryIncidents', totalSegmentSecondaryIncidents);
        segment.set('totalSegmentSecondaryIncidentsSavings', totalSegmentSecondaryIncidentsSavings);

        segment.set('COEmission', totalCOEmission);
        segment.set('CO2Emission', totalCO2Emission);
        segment.set('HCEmission', totalHCEmission);
        segment.set('NOxEmission', totalNOxEmission);
        segment.set('SOxEmission', totalSOxEmission);
      });

      return this;
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

      var benefitCostCTRL = new BenefitCostCTRL();
      
      var totalFuelSavingsMoney = benefitCostCTRL.calculateFuelSavings( segments );
      var totalFuelSavingsGallons = benefitCostCTRL.calculateFuelSavingsGallons( segments );

      $('#fuel').val( Number(totalFuelSavingsGallons).round(2) );

      var benefits = 0;
      var totalSavings = benefitCostCTRL.calculateProjectSavings( segments );
      // Calculate Secondary Incidents Savings
      var secondaryIncidentsSavings = benefitCostCTRL.calculateSecondaryIncidents( segments ) || 0;

      $('#secondary_accidents').val( Number( secondaryIncidentsSavings ).round(2) );

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
        $('#study_period_duration').val( Number( (totalSavings / 3600) / annualStudyPD ).round(2) );
      $('#benefit_cost_ratio').val( Number( benefitCost ).round(2) );

      _this.model.set('benefitCostRatio', benefitCost);
      _this.model.set('secondaryIncidents', secondaryIncidentsSavings * 4736);

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
      // Check if there is a project
      if( _this.model.get('projectName') !== '') {
        // Check if there is at least 1 segment
        if( _this.model.get('segments').length === 0 ) {
          _this.$el.html( ProjectTemplates.NoSegment );
        } else {
          // Get all segments to remove listeners, particularly
          // stop listening to the CHANGE event
          var segments = _this.model.get('segments');
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