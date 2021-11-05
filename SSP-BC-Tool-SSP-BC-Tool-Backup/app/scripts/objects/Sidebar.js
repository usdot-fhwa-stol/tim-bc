/* globals define, GlobalEvent */

'use strict';

//use require since we're just attaching listeners
define([
  'backbone',
  'utilities/template',
  'text!partials/Sidebar.html'
  ], function(Backbone, template, SidebarHTML) {

    var Sidebar = Backbone.View.extend({
      // Containing element
      el: '.sidebar-container',

      template: template( SidebarHTML ),

      initialize: function() {
        this.openTrigger  = $('#sidebarTrigger');
        this.closeTrigger = $('.sidebar-closer');
        // Listen to global trigger of opening the sidebar
        GlobalEvent.on('sidebar-open', this.openSidebar, this );
        GlobalEvent.on('sidebar-close', this.closeSidebar, this );
        // Listen to the closing of overlay mask
        GlobalEvent.on('overlay-mask-closed', this.closeViaMask, this);
        // Listen to enabling links
        GlobalEvent.on('link:enable', this.enableLink, this);
        // Reset the disabled links on New Project
        GlobalEvent.on('sidebar:reset', this.resetLinks, this);
      },

      events: {
        'click .sidebar-closer': 'closeSidebar',
        'click #projectOutput': 'projectOutput',
        'click .disabled': 'disabledLink'
      },

      toggleSidebar : function(e) {
        e.preventDefault();
        GlobalEvent.trigger('overlay-mask-toggle');
        this.$el.toggleClass('shut');
        return this;
      },

      disabledLink: function(e) {
        e.preventDefault();

        return this;
      },

      enableLink: function( options ) {
        var link = options.link;
        var enable = options.enable;

        if( enable ) {
          $(link).removeClass('disabled');
        } else {
          $(link).addClass('disabled');
        }

        return this;
      },

      resetLinks: function() {
        var links = ['.project-details-page', '.project-segments-page', '.project-output-page'];
        _.each(links, function( link ) {
          $(link).addClass('disabled');
        });
        return this;
      },

      openSidebar: function(e) {
        GlobalEvent.trigger('overlay-mask-open');
        this.$el.removeClass('shut');
        this.closeTrigger.focus();
        return this;
      },

      closeSidebar: function(e) {
        if(e) e.preventDefault();
        GlobalEvent.trigger('overlay-mask-close');
        this.$el.addClass('shut');
        this.openTrigger.focus();
        return this;
      },

      closeViaMask: function() {
        this.$el.addClass('shut');
        this.openTrigger.focus();
        return this;
      },

      render: function() {
        this.$el.html( this.template );
      }

    });

    return Sidebar;

  });
