/* globals define */

define(function(require) {

  describe('Dependencies', function() {
  	//jquery
  	describe('jQuery', function() {
  		it('Should be active', function() {
			  require('jquery');
  			var testDisplay = $('body').css('display');
  			testDisplay.should.equal('block');
  		});
  	});

  	describe('Underscore', function() {
  		it('Should be active', function() {
  			require('underscore');
  			var sum = _.reduce([1, 2, 3], function(memo, num){ return memo + num; }, 0);
  			sum.should.equal(6);
  		});
  	});

  	describe('Backbone', function() {
  		it('Should be active', function() {
 				require('backbone');
 				var Model = Backbone.Model.extend({
 					defaults: {
 						isModel: true
 					}
 				});
 				var model = new Model;
 				model.get('isModel').should.equal(true);
  		});
  	});

  });

  describe('Models', function() {
 
 		// //Test Project Model
   //  describe('Project Model', function() {
   //    it('should default "state" property to "Alabama"', function() {
  	// 		var Project = require('model/Project');
  	// 		var model = new Project;
   //      model.get('projectState').should.equal('Alabama');
   //    });
   //  });
 
  });

  describe('Calculations', function() {

    describe('SegmentInfoCTRL', function() {

      it('Should require SegmentInfoCTRL', function() {

        var SegmentInfoCTRL = require('scripts/controllers/SegmentInfoCTRL.js');

        SegmentInfoCTRL.testThis().should.equal('Works');

      });

    });

  });
 
});