/* globals define */

define(function(require) {  

  // Create the ROUND function as part of the Number class
  Number.prototype.round = function(places) {
    return +(Math.round(this + "e+" + places)  + "e-" + places);
  }

  //*******************************************************************************
  // Test for Savings:
  describe('Test Travel Delay for Car', function() {

    describe('Test Travel Delay without SSP: 17 minutes', function() {
      it('Should result in a Travel Delay of 1342.72421063473', function() {

        var SavingsCTRL = require('controllers/SavingsCTRL');
        var savingsCTRL = new SavingsCTRL();

        var meta = {
          avgIncidentDuration : {
            value: 17 * 60
          },
          effectiveSpeed : {
            value : 104.60736
          },
          numberOfLanes : 2,
          blockageNum : 0
        };

        var truckPercentage = 6;
        var trafficVolume = 1600;
        var generalTerrain = 'Flat';

        var TDc = savingsCTRL.getTravelDelayCar( meta, truckPercentage, trafficVolume, generalTerrain );

        Number(TDc).round(6).should.equal(Number(1342.72421063473).round(6));

      });

    });

    describe('Test Travel Delay with SSP: 17 minutes + 4 minutes', function() {
      it('Should result in a Travel Delay of 1390.52075521117', function() {

        var SavingsCTRL = require('controllers/SavingsCTRL');
        var savingsCTRL = new SavingsCTRL();

        var meta = {
          avgIncidentDurationWithSavings : {
            value: (17 + 4) * 60
          },
          effectiveSpeed : {
            value : 104.60736
          },
          numberOfLanes : 2,
          blockageNum : 0
        };

        var truckPercentage = 6;
        var trafficVolume = 1600;
        var generalTerrain = 'Flat';

        var TDc = savingsCTRL.getTravelDelayCar( meta, truckPercentage, trafficVolume, generalTerrain, true );

        Number(TDc).round(6).should.equal(Number(1390.52075521117).round(6));

      });

    });

  });

});