/* globals define, GlobalEvent */

'use strict';

define([
  'backbone',
  'text!partials/SegmentManager.html',
  'utilities/template',
  'models/Segment'
], function( Backbone, SegmentManagerHTML, template, Segment ) {

	var SegmentManagerView = Backbone.View.extend({

		el: '#segments_container',

		template: template( SegmentManagerHTML ),

		initialize: function() {
			// unbind events to avoid duplicating from
			// previous renders
			$(this.el).off('click');
			return this;
		},

		events: {
			'click .copy-segment': 'duplicateSegment',
			'click .delete-segment': 'removeSegment'
		},


		// duplicate a segment based on the element that 
		// triggered the event and its data-segment
		// attribute value
		duplicateSegment: function( evnt ) {
			// prevent element actions and event bubbling
			evnt.preventDefault();
			// get the index of the segment from the data-segment attribute
      var segmentIndex = parseInt( $( evnt.currentTarget ).data('segment') );
      // splice the segment out the segments array
      var segments = project.get('segments');
      // grab the segment according to the index
      var segment = $.extend( true, {}, segments[ segmentIndex ] );
      segments.push( segment );
      project.set('numOfSegments', segments.length);
      // re-render our view
      this.render();
      // trigger an event broadcasting our segments changed
      GlobalEvent.trigger('segments:changed');
      // return view; used for chaining of methods
			return this;
		},

		// remove a segment based on the element that 
		// triggered the event and its data-segment
		// attribute value
		removeSegment: function( evnt ) {
			// prevent element actions and event bubbling
			evnt.preventDefault();
			// get the index of the segment from the data-segment attribute
      var segment = parseInt( $( evnt.currentTarget ).data('segment') );
      // splice the segment out the segments array
      var segments = project.get('segments');
      segments.splice( segment, 1 );
      // adjust the length of the segments accordingly
      project.set('numOfSegments', segments.length);
      // re-render our view
      this.render();
      // trigger an event broadcasting our segments changed
      GlobalEvent.trigger('segments:changed');
      // return view; used for chaining of methods
			return this;
		},

		// list all current segments and add controls
		// for copying and deleting each segment.
		// render the view into the DOM
		// TODO: check for listener duplications
		render: function() {
			var _this = this;
			// render the html
      _this.$el.html('<p class="no-segment hidden"><em>No segment found</em></p>');
      // get segments
      var segments = project.get('segments');
      // check for segments
      if( segments != undefined ) {
	      if( segments.length == 0 ) {
	      	_this.$el.find('.no-segment').removeClass('hidden');
	      } else {
	      	_this.$el.find('.no-segment').addClass('hidden');
	      	// loop through all segments and build each element
		      _.each( segments, function( segment, index) {
		      	// grab segment name or organize it by index if empty
		      	var name = segment.get('name');
		      	var name = ( name !== '' ) ? name : 'Segment ' + ( index + 1 );
		      	// build segment element and controls
		      	var html = '<li class="segment"><a href="#/project/segment/' + ( index + 1 ) + '">' + name + '</a>' + 
		      	'<div class="segment-controls">' +
		      		'<a href="#" class="text-info copy-segment" data-segment="' + index + '"><span class="glyphicon glyphicon-copy"></span> Copy</a> ' +
		      		'<a href="#" class="text-info delete-segment" data-segment="' + index + '"><span class="glyphicon glyphicon-trash"></span> Delete</a></div>' +
		      	'</li>';
		      	// append segment and its controls in the UI
		      	_this.$el.append( html );
		      });
	      }
	    }

      return this;

		}

	});

	return SegmentManagerView;

});