/* globals define, GlobalEvent */

'use strict';

//use require since we're just attaching listeners
define([
  'backbone',
  'utilities/template',
  'text!partials/Sidebar.html',
  'views/SegmentsManagerView'
  ], function(Backbone, template, SidebarHTML, SegmentsManagerView) {

    var Sidebar = Backbone.View.extend({
      // Containing element
      el: '.sidebar-container',

      template: template( SidebarHTML ),

      initialize: function() {
        this.sidebarOpen = false;
        // Listen to global trigger of opening the sidebar
        GlobalEvent.on('sidebar-open', this.openSidebar, this );
        GlobalEvent.on('sidebar-close', this.closeSidebarAndMask, this );
        // Listen to the closing of overlay mask
        GlobalEvent.on('overlay-mask-closed', this.closeSidebar, this);
        // Listen to enabling links
        GlobalEvent.on('link:enable', this.enableLink, this);
        // Reset the disabled links on New Project
        GlobalEvent.on('sidebar:reset', this.resetLinks, this);
      },

      events: {
        'click .sidebar-closer': 'closeSidebarAndMask',
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
        var _this = this;
        GlobalEvent.trigger('overlay-mask-open');
        _this.sidebarOpen  = true;
        _this.$el.removeClass('shut');
        _this.$el.attr('tabindex', 0);
        _this.closeTrigger.attr('tabindex', 0);
        _this.$el.focus();
        var segmentManager = new SegmentsManagerView();
        segmentManager.render();
        _this.restrictFocus();
        return this;
      },

      restrictFocus: function() {
        var _this = this;

        document.addEventListener('focus', function( evnt ) {
          var element = $(evnt.target);
          if ( _this.sidebarOpen && _this.$el.has( element ).length <= 0 ) {
            evnt.stopPropagation();
            _this.$el.focus();
          }
        }, true);

        return this;
      },

      closeSidebar: function(e) {
        if(e) e.preventDefault();
        var _this = this;
        _this.sidebarOpen  = false;
        _this.$el.addClass('shut');
        _this.$el.attr('tabindex', -1);
        _this.closeTrigger.attr('tabindex', -1);
        _this.openTrigger.focus();

        document.removeEventListener('focus', function( evnt ) {
          var _this = this;
          if ( _this.sidebarOpen && _this.$el.find( evnt.target ) ) {
            evnt.stopPropagation();
            _this.closeTrigger.focus();
          }
        }, true);

        return this;
      },

      closeSidebarAndMask: function(e) {
        if(e) e.preventDefault();
        this.closeSidebar();
        GlobalEvent.trigger('overlay-mask-close');
        this.openTrigger.focus();
        return this;
      },

      render: function() {
        this.$el.html( this.template );
        this.openTrigger  = $('#sidebarTrigger');
        this.closeTrigger = $('.sidebar-closer');
        this.closeTrigger.attr('tabindex', -1);
      }

    });

    return Sidebar;

  });
