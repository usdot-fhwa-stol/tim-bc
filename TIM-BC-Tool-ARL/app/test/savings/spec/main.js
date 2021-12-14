/* global describe, it, require */

require.config({
  baseUrl: '/',
  paths: {
    'jquery'        : '../bower_components/jquery/jquery',
    'underscore'    : '../bower_components/underscore/underscore',
    'backbone'      : '../bower_components/backbone/backbone',
    'bootstrap'			: '../bower_components/bootstrap/dist/js/bootstrap',
    'mocha'         : '../../test/bower_components/mocha/mocha',
    'chai'          : '../../test/bower_components/chai/chai',
    'text'          : '../bower_components/requirejs-text/text',
    // Models
    'model'         : '../scripts/models/',
    'controllers'   : '../scripts/controllers',
    'scripts'       : '../scripts/',
    'resource'     : '../scripts/resource',
    'utilities': '../scripts/utilities/'
  },
  shim: {
      underscore: { exports: '_' },
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
      },
	    mocha: { exports: 'mocha' },
	    chai: { exports: 'chai' }
  },
  urlArgs: 'bust=' + (new Date()).getTime()
});

define(function(require) {
 
  require([
    'spec/tests.js'
  ], function(require) {
  	if (window.mochaPhantomJS) {
      mochaPhantomJS.run();
    }
    else {
      mocha.run();
    }
  });
 
});

