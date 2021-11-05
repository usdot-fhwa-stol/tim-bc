/* globals define, GlobalEvent */

'use strict';

define([
  'jquery',
  'scrollReveal'
  ], function(
    $,
    ScrollReveal
  ) {

    var App = function() {

      window.scrollReveal = new ScrollReveal({
        reset: true,
        delay: "once"
      });
      
    };

    return App;

  });//---
