/* globals define, GlobalEvent */

/* 
 * @author Robert Roth 
 * @desc This is the View for the Project Details page
 */

'use strict';

define([
  'backbone',
  'text!partials/ProjectDetails.html',
  'States',
  'models/Segment',
  'utilities/template',
  'controllers/DetailsValidateCTRL'
], function(Backbone, ProjectDetailsHTML, States, Segment, template, DetailsValidateCTRL ) {

  var ProjectDetails = Backbone.View.extend({

    el: '#container',

    template : template( ProjectDetailsHTML ),

    initialize : function( options ) {
      // Cache this to self and use it to avoid
      // this object confusion in some code
      var self = this;
      //--
      // Grab the Project Name entered in New Project page
      self.projectName = options.projectName;
      //--
      //self.listenTo(this.model, 'change', self.console);

      //self.render();

      GlobalEvent.on('submit-calculation', function() {
        self.render();
      });

      GlobalEvent.on('project:details', function () {
        self.render();
      });

      self.listenTo( self.model, 'change:numOfSegments',function() {
        var linkRef = $('.project-details-page');
        var active = linkRef.hasClass('active');
        if( active ) {
          self.render();
        }
      });

      self.listenTo( self.model, 'change:totalProgramCost', self.render);



      this.validation = new DetailsValidateCTRL();

    },

    events : {
      'click .clear-jumbo-input' : 'clearInput',
      'click .calculate-trigger' : 'calculateTrigger',
      'change #project_state' : 'updateState',
      'change #total_program_cost' : 'updateProgramCost',
      'keyup #number_of_incidents_on_program_roadway' : 'updateIncidents',
      'change #number_of_incidents_on_program_roadway' : 'updateIncidents',
      'keyup #study_period_duration' : 'updateStudyPeriod',
      'change #study_period_duration' : 'updateStudyPeriod',
      'change #number_of_segments' : 'updateSegments',
      'click #segment_detail_trigger' : 'proceedNext',
      'click input[type="text"]': 'selectInput',
      'click .glyphicon-info-sign' : 'clearEvent'
    },

    clearEvent: function( evnt ) {
      if( evnt ) {
        evnt.preventDefault();
        evnt.stopPropagation();
      }
      return this;
    },

    proceedNext: function( evnt ) {
      //this.clearEvent( evnt );
      this.validateProjectDetails();
      return this;
    },

    validateInput: function( input, attribute ) {
      var num = Number( input.value );
      var defaultAttribute = this.model.get( attribute ) || 0;
      if( typeof num == 'number' && ! isNaN( num ) && num > 0 ) {
        return true;
      } else {
        alert('Error: This field requires a NUMBER greater than 0.');
        input.value = defaultAttribute;
        return false;
      }

      return this;
    },

    validateProjectDetails: function() {

      var valid = this.validation.validateProjectDetails( this.model );

      if( valid ) {
        GlobalEvent.trigger('link:enable', {
          link: '.project-segments-page',
          enable: true
        });
        GlobalEvent.trigger('proceed:segmentInfo');
      } else {
        GlobalEvent.trigger('link:enable', {
          link: '.project-segments-page',
          enable: false
        });
        alert('Error: Please review each value and fix any error.');
      }

      return this;

    },

    calculateTrigger : function(evt) {
      evt.preventDefault();
      GlobalEvent.trigger('calculate:open');
      return this;
    },

    updateState : function( evt ) {
      var _this = this;
      _this.clearEvent(evt);
      _this.model.set('projectState', evt.currentTarget.value);
      _.each(_this.model.get('segments'), function( segment ) {
        segment.set('region', 'Select Region');
      });
      
      return this;
    },

    updateProgramCost : function(evt) {
      var _this = this;
      _this.clearEvent(evt);
      var input = evt.currentTarget;
      if( _this.validateInput(input, 'totalProgramCost') ) {
        var value = input.value;
        _this.model.set('totalProgramCost', value);
      }

      return this;
    },

    updateIncidents : function(evt) {
      this.clearEvent(evt);
      var input = evt.currentTarget;
      if( this.validateInput(input, 'numOfIncidentsOnProgramRoadway') ) {
        this.model.set('numOfIncidentsOnProgramRoadway', evt.currentTarget.value);
      }
      return this;
    },

    updateStudyPeriod : function(evt) {
      this.clearEvent(evt);
      var input = evt.currentTarget;
      if( this.validateInput(input, 'studyPeriodDuration') ) {
        this.model.set('studyPeriodDuration', evt.currentTarget.value);
      }
      return this;
    },

    updateSegments : function( evt ) {
      this.clearEvent(evt);
      // Get number of segments
      var input = {};

      if( evt != undefined ) {
        input = evt.currentTarget;
      } else {
        input.value = parseInt( $('#number_of_segments').val() );
      }
      //input.value = Number(input.value);
      if( this.validateInput(input, 'numOfSegments') ) {
        if( input.value > 0 && input.value <= 30 ) {
          this.model.set('numOfSegments', input.value);
          this.generateSegments();
        } else {
          alert('1 - 30 Segments only!');
          $(evt.currentTarget).val( this.model.get('numOfSegments') );
        }
      }

      return this;
    },

    generateSegments : function(evt) {
      this.clearEvent(evt);
      console.log('Generate Segments');
      var count = this.model.get('numOfSegments');
      var segments = this.model.get('segments');
      // Segments is not empty analyze segment
      if( segments ) {
        // if new amount of segment entered is less
        // than current segment,
        if( count < segments.length ) {
          while( segments.length > count ) {
            segments.pop();
          }
        } else {
          while( segments.length < count ) {
            segments.push( new Segment );
          }
        }

      } else {
        for( var i = 1, len = parseInt( count ); i <= len; i++ ) {
          segments.push( new Segment );
        }
      }
      this.model.set('segments', segments);
      return this;
    },

    loadModelValues : function (evt) {
      this.clearEvent(evt);
      // Select Project's state
      this.$el.find('#project_name').text( this.model.get('projectName') );
      if( this.model.get('projectState') !== '' ) {
        this.$el.find('#project_state').val( this.model.get('projectState') );
      }
      this.$el.find('#total_program_cost').val( Number(this.model.get('totalProgramCost')).round(2) );
      this.$el.find('#number_of_incidents_on_program_roadway').val( this.model.get('numOfIncidentsOnProgramRoadway') );
      if( this.model.get('segments') != undefined ) {
        this.$el.find('#number_of_segments').val( this.model.get('segments').length );
      }
      return this;
    },

    selectState: function(evt) {
      this.clearEvent(evt);
      var select = this.$el.find('#project_state');
      select.val( this.model.get('projectState') );
    },

    selectInput: function(evt) {
      $(evt.currentTarget).select();
      return this;
    },

    console : function(model) {
      console.log( model.attributes );
      return this;
    },

    render : function() {
      if( this.model.get('projectName') !== '' && this.model.get('projectName') !== undefined ) {
        // render template/partial:
        this.$el.html( this.template( this.model.toJSON() ) ).trigger('change');
        //---
        // Populate the options for the select element with states:
        var options = '';
        for(var x = 0, len = States.length; x < len; x++ ) {
          options += '<option value="' + States[x] + '">' + States[x] + '</options>\n';
        }
        $('#project_state').append(options);
        //---
        // Populate State Select values:
        this.selectState();
        // Initialize a segment for a new project
        this.updateSegments();
        //--
        // Bootstrap.js function that initializes tooltips
        $('.info').tooltip();
        //--
      } else {
        this.$el.html(
          '<div class="container center-text">' +
          '<h1>Ooops! No Project found..</h1>' +
          '<p>Avoid refreshing the page while working on a project or you\'ll lose all data.<br>Start a new Project or Upload Project Data.</p>' +
          '<a href="#/project/new" class="btn btn-primary" style="display: block; margin: 40px auto; width: 180px;">' +
          '<span class="glyphicon glyphicon-chevron-left"></span> Create Project</a>' +
          '</div>'
          );
      }
      //--
      // Trigger sidebar active item
      GlobalEvent.trigger('sidebar-navigation', { item: 'project-details-page' });
      return this;
    }// render()

  });

  return ProjectDetails;

});
