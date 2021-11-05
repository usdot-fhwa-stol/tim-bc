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
        scrollReveal : '../bower_components/scrollReveal.js/dist/scrollReveal'
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
    'bootstrap'
], function( Router, App, FileSaver, bootstrap ) {

  //****************************************************//
  //start the app
  var router = new Router();
  console.log('Router - Initiated');

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

  // $('.stage').mousemove(function(e){
  //   var amountMovedX = (e.pageX * -1 / 6);
  //   var amountMovedY = (e.pageY * -1 / 6);
  //   $(this).css('background-position', amountMovedX + 'px ' + amountMovedY + 'px');
  // });

  // $('.launch').click( function(e) {
  //   e.preventDefault();
  //   var _this = $(this);
  //   $('.curtain').animate({
  //     'height': '100%'
  //   }, 500, function() {
  //     setTimeout(function() {
  //       window.location = _this.attr('href');
  //     }, 500);
  //   })
  // });

});
