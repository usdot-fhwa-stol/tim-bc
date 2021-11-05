/* globals define */

'use strict';

define([
  'jquery'
  ], function($) {

      var About = function() {

        this.$el = $('#aboutElement');
        this.$openTrigger = $('#aboutOpenTrigger');
        this.$closeTrigger = $('#aboutCloseTrigger');

        this.constructor.prototype.initialize = function() {

          var self = this;

          self.$openTrigger.on('click', function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            self.open();
          });

          self.$closeTrigger.on('click', function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            self.close();
          });

        };

        this.constructor.prototype.open = function() {
          this.$el.removeClass('vanish');
          this.$closeTrigger.focus();
        };

        this.constructor.prototype.close = function() {
          this.$el.addClass('vanish');
          this.$openTrigger.focus();
        };

      };

      return About;

});
