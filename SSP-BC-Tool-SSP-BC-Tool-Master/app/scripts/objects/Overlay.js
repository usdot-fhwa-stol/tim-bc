/* globals define, GlobalEvent */

'use strict';

//use require since we're just attaching listeners
define([
  'jquery'
  ], function($) {

    var Overlay = {

      $el: $('.overlay-mask'),

      _initialize: function() {
        var self = this;

        GlobalEvent.on('overlay-mask-open', self._open, this);
        GlobalEvent.on('overlay-mask-close', self._close, this);
        GlobalEvent.on('overlay-close-triggerless', self._close, this);
        GlobalEvent.on('overlay-mask-toggle', self._toggle, this);

        self.$el.on('click', function() {
          self._close();
        });

      },

      _toggle : function() {
        this.$el.toggleClass('hidden');
        GlobalEvent.trigger('overlay-mask-toggled');
        return this;
      },

      _close : function() {
        this.$el.addClass('hidden');
        GlobalEvent.trigger('overlay-mask-closed');
        return this;
      },

      _closeNoTrigger : function() {
        this.$el.addClass('hidden');
        return this;
      },

      _open : function() {
        this.$el.removeClass('hidden');
        GlobalEvent.trigger('overlay-mask-opened');
        return this;
      }

    };

    return Overlay;

  });
