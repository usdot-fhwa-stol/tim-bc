/* globals define */

'use strict';

define(['underscore'], function(_) {

  //another global variable for our template helper
  var template = function( html ) {
    _.templateSettings = {
      interpolate: /\{\{(.+?)\}\}/g
    };

    return _.template( html );
  };

  return template;

});
