/* globals define, GlobalEvent */

'use strict';

define([
  'backbone',
  'text!partials/Main.html',
  'utilities/template'
], function(Backbone, MainHTML, template) {


  var MainController = Backbone.View.extend({

    el: '#container',

    template: template( MainHTML ),

    initialize: function () {

    },

    events : {
      'click .upload-project' : 'uploadFile'
    },

    uploadFile : function (evt) {
      evt.preventDefault();
      $('#fileReader').trigger('click');
    },

    render: function() {
      this.$el.html( this.template ).trigger('change');

      // Trigger sidebar active item
      GlobalEvent.trigger('sidebar-navigation', { item: 'home-page' });
    }

  });

  return MainController;

});
