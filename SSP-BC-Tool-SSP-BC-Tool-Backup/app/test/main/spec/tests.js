/* globals define */

define(function(require) {

  //*******************************************************************************
  // Test for DEPENDENCIES:
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

  //*******************************************************************************
  // Test for MODELS:
  describe('Models', function() {
 
 		//Test Project Model
    describe('Project Model', function() {
      it('should default "state" property to "Alabama"', function() {
  			var Project = require('model/Project');
  			var model = new Project;
        model.get('projectState').should.equal('Alabama');
      });
    });
 
  });

  //*******************************************************************************
  // Test for CALCULATIONS:
  describe('Calculations', function() {
    // initializing SavingsCTRL on a broader scope to make it
    // usable in other test without declaring it over and over
    var SavingsCTRL = require('controllers/SavingsCTRL');
    var savingsCTRL = new SavingsCTRL();

    // Test if SavingsCTRL exists
    describe('SavingsCTRL', function() {
      it('Should be able to require SavingsCTRL', function() {
        // if one of its function exist then controller is not undefined
        (typeof savingsCTRL.getCurvatureImpact).should.equal('function');
      });
    });//-

    // Test if we get correct averages for a given speed
    describe('Effective Speed', function() {
      it('Should return an upper and lower value for 65 MPH', function() {
        var speed = 65;
        var effSpeed = savingsCTRL.getSpeedAVG( speed );
        effSpeed.upper.should.equal( 120 );
        effSpeed.lower.should.equal( 100 );
        effSpeed.value.should.equal( 104.6071 );
      });
    });//-

    // Test if we get correct averages for a given incident duration
    describe('Incident Duration', function() {
      it('Should return an upper and lower value for 6 minutes', function() {
        var incidentDurationMinutes = 6;
        var avgIncidentDuration = savingsCTRL.incidentDurationAVG( incidentDurationMinutes );
        avgIncidentDuration.upper.should.equal( 600 );
        avgIncidentDuration.lower.should.equal( 300 );
        avgIncidentDuration.value.should.equal( 360 );
      });
    });//-

    // Test if rounding up or down depending on values return correctly
    describe('Rounded Traffic Volume', function() {
      it('Should return a rounded up value for 760 as 1000', function() {
        var trafficVolume = 750;
        var roundedTrafficVolume = savingsCTRL.getRoundedTrafficVolume( trafficVolume );
        roundedTrafficVolume.should.equal( 1000 );
      });
      it('Should return a rounded down value for 520 as 500', function() {
        var trafficVolume = 740;
        var roundedTrafficVolume = savingsCTRL.getRoundedTrafficVolume( trafficVolume );
        roundedTrafficVolume.should.equal( 500 );
      });
    });//-

    // Test getting the travel delay of flat speed and incident durations
    describe('Travel Delay: Flat Speed and Incident Duration', function() {
      it('Should return correct travel delay', function() {
        var meta = {
          effectiveSpeed : {
            value: 60,
            upper: 60,
            lower: 60
          },
          avgIncidentDuration : {
            value: 900,
            upper: 900,
            lower: 900
          },
          trafficVolume: 500,
          numberOfLanes: 2,
          blockageNum: 0
        };
        savingsCTRL.getTravelDelay( meta, 'car' ).should.equal(138741.9567);
      });
    });//-

    // Test getting the travel delay of flat speed and incident durations
    describe('Travel Delay: Flat Incident Duration and an Averaged Speed', function() {
      it('Should return correct travel delay', function() {
        var meta = {
          effectiveSpeed : savingsCTRL.getSpeedAVG( 58.5 ),
          avgIncidentDuration : {
            value: 300,
            upper: 300,
            lower: 300
          },
          trafficVolume: savingsCTRL.getRoundedTrafficVolume( 790 ),
          numberOfLanes: 3,
          blockageNum: 1
        };
        savingsCTRL.getTravelDelay( meta, 'car' ).should.equal( 298897.93327805 );
      });
    });//-

    // Test getting the travel delay of flat speed and incident durations
    describe('Travel Delay: Flat Speed and an Averaged Incident Duration', function() {
      it('Should return correct travel delay', function() {
        var meta = {
          effectiveSpeed : {
            value: 80,
            upper: 80,
            lower: 80
          },
          avgIncidentDuration : savingsCTRL.incidentDurationAVG( 7 ),
          trafficVolume: 500,
          numberOfLanes: 3,
          blockageNum: 1
        };
        savingsCTRL.getTravelDelay( meta, 'car' ).should.equal( 95318.3 );
      });
    });//-

    // Test getting the travel delay of flat speed
    describe('Travel Delay: Speed and Incident Duration are Averaged', function() {

      describe('Should return correct travel delays:', function() {
        it('Speed: 65 MPH, Duration: 1 min, Volume: 580, Lanes: 3, Blockage: Shoulder', function() {
          var meta = {
            numberOfLanes: 3,
            blockageNum: 0
          };
          meta.trafficVolume = savingsCTRL.getRoundedTrafficVolume( 580 );
          meta.effectiveSpeed = savingsCTRL.getSpeedAVG( 65 );
          meta.avgIncidentDuration = savingsCTRL.incidentDurationAVG( 1 );
          savingsCTRL.getTravelDelay( meta, 'car' ).should.equal( 55422.731405109706 );
        });
        
        it('Speed: 65 MPH, Duration: 2 min, Volume: 580, Lanes: 3, Blockage: One Lane', function() {
          var meta = {
            numberOfLanes: 3,
            blockageNum: 1
          };
          meta.trafficVolume = savingsCTRL.getRoundedTrafficVolume( 580 );
          meta.effectiveSpeed = savingsCTRL.getSpeedAVG( 65 );
          meta.avgIncidentDuration = savingsCTRL.incidentDurationAVG( 2 );
          savingsCTRL.getTravelDelay( meta, 'car' ).should.equal( 55798.08502808177 );
        });
      });//-

    });//-

    // Test getting the travel delay of flat speed
    describe('Travel Delay: Negative Truck Value', function() {

      describe('Should return correct travel delays:', function() {
        it('Speed: 65 MPH, Duration: 12 min, Volume: 3790, Lanes: 3, Blockage: Shoulder', function() {
          var meta = {
            numberOfLanes: 3,
            blockageNum: 0
          };
          meta.trafficVolume = savingsCTRL.getRoundedTrafficVolume( 1263 );
          meta.effectiveSpeed = savingsCTRL.getSpeedAVG( 65 );
          meta.avgIncidentDuration = savingsCTRL.incidentDurationAVG( 12 );
          savingsCTRL.getTravelDelay( meta, 'truck' ).should.equal( 828.3803148100001 );
        });

        it('Speed: 65 MPH, Duration: 10 min, Volume: 3790, Lanes: 3, Blockage: Shoulder', function() {
          var meta = {
            numberOfLanes: 3,
            blockageNum: 0
          };
          meta.trafficVolume = savingsCTRL.getRoundedTrafficVolume( 1263 );
          meta.effectiveSpeed = savingsCTRL.getSpeedAVG( 65 );
          meta.avgIncidentDuration = savingsCTRL.incidentDurationAVG( 10 );
          savingsCTRL.getTravelDelay( meta, 'truck' ).should.equal( 830.95175945 );
        });
      });//-

    });//-

    describe('Calculates the Benefit/Cost Ratio', function() {
      it('Should return the correct value: 3.11', function() {
        var totalBenefits =  70000;
        var annualStudyPD = 9;
        var annualCost = 30000;
        // original formula was:((totalTruckMoney + totalCarMoney) / annualStudyPD) / annualCost;
        // changed to fit test cases, and used totalBenefits instead..
        var benefitCost = (totalBenefits / (annualStudyPD / 12)) / annualCost;

        benefitCost.should.equal( 3.111111111111111 );
      });
    });

  });

});