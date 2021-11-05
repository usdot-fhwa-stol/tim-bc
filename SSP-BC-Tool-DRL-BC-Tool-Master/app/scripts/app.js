/* globals define, GlobalEvent */

'use strict';

define([
  'jquery',
  'objects/Sidebar',
  'objects/Overlay',
  'scrollReveal',
  'objects/About'
  ], function(
    $,
    Sidebar,
    Overlay,
    ScrollReveal,
    About
  ) {

    var App = function() {

      var aboutModule = new About();
      aboutModule.initialize();

      var sidebar = new Sidebar();
      sidebar.render();
      Overlay._initialize();

      window.scrollReveal = new ScrollReveal();

      $('#sidebarTrigger').on('click', function(e) {
        e.preventDefault();
        // console.log('Sidebar trigger open');
        GlobalEvent.trigger('sidebar-open');
      });

      $('.upload-file-trigger').on('click', function(evt) {
        evt.preventDefault();
        $('#fileReader').trigger('click');
      });

      GlobalEvent.on('sidebar-navigation', function(e) {
        // console.log('Sidebar Navigation');
        var activeItem = $('.' + e.item);
        activeItem.addClass('active').siblings('li').removeClass('active');
        //GlobalEvent.trigger('sidebar-close');
      });

      //Code for prompting page refresh
      // window.onbeforeunload = function() {
      //   return "Data will be lost if you leave the page. Make sure to save your project before refreshing or leaving the page.";
      // };
    };

    return App;

  });//---
