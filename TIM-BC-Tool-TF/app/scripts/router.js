/* global define, saveAs, GlobalEvent, _ */

'use strict';

define([
  'backbone',
  'models/Project',
  'models/Segment',
  'views/MainView',
  'views/NewProjectView',
  'views/ProjectDetailsView',
  'views/CalculateView',
  'views/SegmentInfoView',
  'views/SSPOutputView',
  'text!partials/LearnMore.html'
  ], function( 
    Backbone,
    Project,
    Segment,
    MainView,
    NewProjectView,
    ProjectDetailsView,
    CalculateView,
    SegmentInfoView,
    SSPOutputView,
    LearnMore
    ){

    // Project Model
    var project = new Project();
    window.project = project;
    var mainView = new MainView();
    var newProjectView = new NewProjectView({ model : project });
    var projectDetailsView = new ProjectDetailsView({ model : project });
    var calculateView = new CalculateView({ model: project });
    var segmentInfoView = new SegmentInfoView({ model : project });
    var sspOutputView = new SSPOutputView({ model : project });

    calculateView.render();

    var Router = Backbone.Router.extend({

      initialize : function () {
        Backbone.history.start();
        //log showing it started
        console.log('SSP-BC-Tool - Initialized');
      },

      routes : {
        ''                        : 'index',
        'application/learn'       : 'learnMore',
        'project/new'             : 'newProject',
        'project/rename'          : 'renameProject',
        'project/details'         : 'projectDetails',
        'project/segment/:id'     : 'segmentInfo',
        'project/output'          : 'projectOutput'
      },

      index : function() {
        mainView.render();
      },

      learnMore : function() {
        $('#container').html('<div class="container" style="padding-bottom: 40px;"><h1 style="margin-bottom: 40px">Learn More</h1></div>');
        $('#container > .container').append( LearnMore );
      },

      // New Project resets the model, and unmounts any uploaded file.
      newProject : function () {
        // Reset Project Model
        project.defaults.segments = [];
        project.clear().set(project.defaults);
        $('#saveProject').addClass('hidden');
        GlobalEvent.trigger('sidebar:reset');
        // Remove Uploaded File: This fixes the bug when uploading a project and then
        // creating a new project, and then uploading the same previous project.
        $('#fileReader').val("");
        // Render New Project View
        newProjectView.render();
        $('body').data('page', 'new-project');
      },

      // This behaves the same as New Project except it doesn't reset the
      // project and does not unmount the current uploaded project
      renameProject : function () {
        newProjectView.render();
      },

      projectDetails : function() {
        projectDetailsView.render();
        $('body').data('page', 'project-details');
      },

      segmentInfo : function(id) {
        segmentInfoView.render(id);
      },

      projectOutput : function() {
        sspOutputView.render();
      },
      
    });

    // saving Project into a JSON file
    $('#saveProject').on('click', function(evt) {
      evt.preventDefault();
      var data = JSON.stringify(project.toJSON());
      var projectFile = new Blob( [data], //array
          { type: 'text/json', endings: 'native' } //dictionary object
        );
      saveAs(projectFile, 'TIM-TF-' + project.get('projectName') + '.json');
    });

    $('.validateProject').on('click', function(evt){
      evt.preventDefault();
      var projectName = project.get('projectName');
      if(projectName.length > 0)
      {
        if(confirm("Are you sure to discard current project?"))
        {          
          GlobalEvent.trigger('project:new');
        }
      }
    });
    $('.validateProjectReturnMain').on('click', function(evt){
      evt.preventDefault();
      var projectName = project.get('projectName');
      if(projectName.length > 0)
      {
        if(confirm("Are you sure to discard current project?"))
        {
          window.location.replace("../../index.html");
        }
      }
    });
    // Watch for Project Name change, and allow or disallow
    // saving of the project if the name entered by the user
    // is not valid
    $('#container').on('change', function( options ) {
      var model = options.model;
      var projectName = project.get('projectName');
      if( projectName ) {
        projectName = projectName.replace(/\s/g, '');
        if( projectName != '' ) {
          $('#saveProject').removeClass('hidden');
        } else {
          $('#saveProject').addClass('hidden');
        }
      }
    });

    // Uploading of a Project
    $('#fileReader').on('change', function(evt) {
      console.log('RouterJS: FileReader Loaded.');
      // Create a new FileReader object
      var reader = new FileReader();
      // Read in the image file as a binary string.
      try {
        reader.readAsText(evt.target.files[0]);
        // Triggers on successful load of a file
        reader.onload = function() {
          // Reset the Sidebar's links, disabling most of them
          GlobalEvent.trigger('sidebar:reset');
          // Parse the JSON from file and do a 'deep copy' to our
          // model's attributes
          _.extend(project.attributes, $.parseJSON(this.result));
          // Get Project Name and check if 'empty'
          var projectName = project.get('projectName');
          // Remove whitespaces
          projectName = projectName.replace(/\s/g, '');
          // If Project Name is valid, enable Project Details page
          if( projectName != '') {
            GlobalEvent.trigger('link:enable', {
              link: '.project-details-page',
              enable: true
            });
          }

          // Rebuild our Segments from the saved segments object
          // and turn it into a Backbone model with all complete
          // attributes, properties, and functions
          var segments = project.get('segments');

          // Check for invalid segments for enablind other Sidebar links
          var invalidSegments = 0;

          // Loop through all segments and do a 'deep copy' of the 
          // attributes to avoid referencing objects
          var newSegment, arraySegments = [];
          _.each(segments, function( segment ) {
            // Check for segment validity
            if( segment.valid != true ) invalidSegments++;
            newSegment = new Segment();
            _.extend(newSegment.attributes, segment);
            segment = newSegment;
            arraySegments.push( newSegment );
          });

          // Enable SSP Output Menu Link if all Segments
          // are valid
          if( invalidSegments == 0 ) {
            GlobalEvent.trigger('link:enable', {
              link: '.project-output-page',
              enable: true
            });
            GlobalEvent.trigger('link:enable', {
              link: '.project-segments-page',
              enable: true
            });
          }

          // Add all our segments in the our project model
          project.set('segments', arraySegments);

          // Trigger file upload for pubsub listeners
          GlobalEvent.trigger('projectFileUploaded');
          GlobalEvent.trigger('project:details');
        };
      } catch(e) {
        // Log when upload was cancelled by the user
        console.log('RouterJS: Cancelled Upload.');
      }
      
    });

    return Router;

});//--
