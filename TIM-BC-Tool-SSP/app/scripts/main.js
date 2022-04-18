/*global require, _, GlobalEvent */
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
        text : '../bower_components/requirejs-text/text',
        scrollReveal : '../bower_components/scrollreveal/dist/scrollreveal',
        Controller: './controllers/Controller'
    }
});

require(['backbone'], function(Backbone) {
  // create Backbone Event for multiple views triggering
  window.GlobalEvent = {};
  _.extend(GlobalEvent, Backbone.Events);

  Backbone.Model.prototype.segmentJSON = function( option ) {
    var segment = option.segment;
    return _.clone( this.attributes.segments[segment] );
  }
});

require([
    'router',
    'app',
    'vendor/FileSaver',
    'bootstrap'
], function( Router, App, FileSaver, bootstrap ) {

  //****************************************************//
  //start the app
  var router = new Router();
  console.info('Router - Initiated');
  Backbone.history.start();
  //log showing it started
  console.info('SSP-BC-Tool - Initialized');

  //****************************************************//
  //added function to capitalize first letters
  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };
  
  Number.prototype.round = function(places) {
    return +(Math.round(this + "e+" + places)  + "e-" + places);
  }

  // Placed the listeners that needs to be attached after
  // everything is rendered inside App
  new App();
  // Always goes on main page on refresh
  // This avoid a lot of trouble.
  router.navigate('', { trigger: true });
  // When Segment selection changes load route to the proper segment
  GlobalEvent.on('segment-change', function( option ) {
    router.navigate('project/segment/' + option.segment, { trigger: true });
  });
  // This triggers when a file is successfully uploaded
  if( GlobalEvent._events.projectFileUploaded == undefined ) {
    GlobalEvent.on('projectFileUploaded', function () {
      // console.log('MainJS: Project Upload Trigger');
      router.navigate('project/details', { trigger: true });
      //location.href = location.pathname + '#/project/details';
      GlobalEvent.trigger('validate:project');
    });
  }
  // Navigate to project details
  GlobalEvent.on('project:details', function( option ) {
    router.navigate('project/details', { trigger: true });
  });
  GlobalEvent.on('project:new', function( option ) {
    router.navigate('project/new', { trigger: true });
  });
  // When Calculate Ratio is clicked we need to show the output page
  GlobalEvent.on('project:output', function( option ) {
    router.navigate('project/output', { trigger: true });
  });
  // When an error occurs in calculating benefit/cost and
  // is caused by some needed values missing..
  GlobalEvent.on('output:error', function( option ) {
    console.log('Segment Information Error: Missing Parameters');
    //router.navigate('project/segment/1', { trigger: true });
  });
  // Proceeds to the next route Segment Info
  GlobalEvent.on('proceed:segmentInfo', function ( options ) {
    router.navigate('project/segment/1', { trigger: true });
  });

});
