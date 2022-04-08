/* globals define, alert */

'use strict';

define([
  'backbone',
  'text!partials/NewProject.html',
  'utilities/template'
], function(Backbone, NewProjectHTML, template ) {

  var NewProjectController = Backbone.View.extend({

    el: '#container',

    template : template( NewProjectHTML ),

    initialize : function() {

      var self = this;

      self.listenTo( self.model, 'change', function() {
        self.$el.trigger('change');
      });

    },

    events : {
      'click .clear-jumbo-input' : 'clearInput',
      'click .uploadFile' : 'uploadFile',
      'click #createProject' : 'createProject',
      'change #projectName' : 'updateProjectName',
      'keyup #projectName' : 'enterKey'
    },

    clearEvent: function( evnt ) {
      if( evnt ) {
        evnt.preventDefault();
      }
      return this;
    },

    clearInput : function( evnt ) {
      this.clearEvent( evnt );
      var control = $(evnt.currentTarget).data('control');

      $('#' + control).val('');
      $('#saveProject').addClass('hidden');
      this.updateProjectName('');

      GlobalEvent.trigger('link:enable', { link: '.project-details-page', enable: false});

      return this;
    },

    uploadFile : function( evnt ) {
      this.clearEvent( evnt );
      $('#fileReader').trigger('click');
    },

    updateSidebarLink: function( valid ) {
      // Test for sidebar link enabling or disabling
      if( valid ) {
        GlobalEvent.trigger('link:enable', { link: '.project-details-page', enable: true});
      } else {
        GlobalEvent.trigger('link:enable', { link: '.project-details-page', enable: false});
      }

      return this;
    },

    enterKey : function( evnt ) {
      this.clearEvent( evnt );

      var valid = this.validateProjectName( evnt.currentTarget.value );

      if( evnt.keyCode === 13 ) {
        this.createProject();
      } else {
        // Enable or disable Sidebar link for Project Details
        this.updateSidebarLink( valid );
      }
      
      return this;
    },

    validateProjectName: function( string ) {
      var checkSpaces = string.replace(/\s/g, '');

      if( checkSpaces != '' ) {
        return true;
      } else {
        return false;
      }

    },

    createProject : function( evnt ) {
      this.clearEvent( evnt );

      var projectName = $('#projectName').val() || '';
      var valid = this.validateProjectName( projectName );

      if( valid ) {
        this.updateProjectName( projectName );
        location.href = '#/project/details';
      } else {
        alert('Project Name is empty!');
      }

    },

    updateProjectName : function( name ) {
      if( typeof name != 'string' ) {
        name = $('#projectName').val();
      }
      if( name.replace(/\s/g, '') == '' ) {
        $('#saveProject').addClass('hidden');
      }

      this.model.set('projectName', name);

      return this;
    },

    render : function() {
      // Load template/partial
      this.$el.html( this.template( this.model.toJSON() ) ).trigger('change');
      // Trigger sidebar active item
      GlobalEvent.trigger('sidebar-navigation', { item: 'project-name-page' });
      // Focus on the Project Name input
      $('#projectName').focus();
    }

  });

  return NewProjectController;

});
