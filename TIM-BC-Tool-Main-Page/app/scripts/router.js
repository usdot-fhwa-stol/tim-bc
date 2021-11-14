/* global define, saveAs, GlobalEvent, _ */

'use strict';

define([
  'views/MainView',
  ], function(
    MainView
    ){

    var mainView = new MainView();

    var Router = Backbone.Router.extend({

      initialize : function () {
        Backbone.history.start();
        //log showing it started
        console.log('SSP-BC-Tool - Initialized');
      },

      routes : {
        ''                        : 'index'
      },

      index : function() {
        mainView.render();
      }
      
    });

    return Router;

});//--
