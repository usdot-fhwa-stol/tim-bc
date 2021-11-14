/* globals define */

'use strict';

define([
  'backbone'
  ], function( Backbone ) {

  var Segment = Backbone.Model.extend({
    defaults : {
        name : '',
        region: 'Select Region',
        segmentLength: 0,
        numberOfRamps: 0,
        numberOfRampsSpeedReduction: 0,
        numberOfTrafficLanesByDirection: 2,
        generalTerrain: 'Flat',
        horizontalCurvature: 'Straight',
        horizontalCurvatureSpeedReduction: 0,

        mainLaneSpeedLimit: 0,

        // AM PEAK
        amPeakChecked: 'checked',
        amPeakVisibility: 'visible',
        amPeakTrafficVolume: 0,
        amPeakTruckPercentage: 0,
        // AVGID = Avg Incident Duration
        amPeakShoulderBlockageAVGID: 0,
        amPeakOneLaneBlockageAVGID: 0,
        amPeakTwoLaneBlockageAVGID: 0,
        amPeakThreeLaneBlockageAVGID: 0,
        amPeakFourLaneBlockageAVGID: 0,
        // ManIndt = Managed Incident
        amPeakShoulderBlockageManIndt: 0,
        amPeakOneLaneBlockageManIndt: 0,
        amPeakTwoLaneBlockageManIndt: 0,
        amPeakThreeLaneBlockageManIndt: 0,
        amPeakFourLaneBlockageManIndt: 0,
        
        // PM PEAK
        pmPeakChecked: '',
        pmPeakVisibility: 'hidden',
        pmPeakTrafficVolume: 0,
        pmPeakTruckPercentage: 0,
        // AVGID = Avg Incident Duration
        pmPeakShoulderBlockageAVGID: 0,
        pmPeakOneLaneBlockageAVGID: 0,
        pmPeakTwoLaneBlockageAVGID: 0,
        pmPeakThreeLaneBlockageAVGID: 0,
        pmPeakFourLaneBlockageAVGID: 0,
        // ManIndt = Managed Incident
        pmPeakShoulderBlockageManIndt: 0,
        pmPeakOneLaneBlockageManIndt: 0,
        pmPeakTwoLaneBlockageManIndt: 0,
        pmPeakThreeLaneBlockageManIndt: 0,
        pmPeakFourLaneBlockageManIndt: 0,
        
        // WEEKDAY OFF PEAK
        weekdayOffPeakChecked: '',
        weekdayOffPeakVisibility: 'hidden',
        weekdayOffPeakTrafficVolume: 0,
        weekdayOffPeakTruckPercentage: 0,
        // AVGID = Avg Incident Duration
        weekdayOffPeakShoulderBlockageAVGID: 0,
        weekdayOffPeakOneLaneBlockageAVGID: 0,
        weekdayOffPeakTwoLaneBlockageAVGID: 0,
        weekdayOffPeakThreeLaneBlockageAVGID: 0,
        weekdayOffPeakFourLaneBlockageAVGID: 0,
        // ManIndt = Managed Incident
        weekdayOffPeakShoulderBlockageManIndt: 0,
        weekdayOffPeakOneLaneBlockageManIndt: 0,
        weekdayOffPeakTwoLaneBlockageManIndt: 0,
        weekdayOffPeakThreeLaneBlockageManIndt: 0,
        weekdayOffPeakFourLaneBlockageManIndt: 0,
        
        // WEEKEND
        weekendChecked: '',
        weekendVisibility: 'hidden',
        weekendTrafficVolume: 0,
        weekendTruckPercentage: 0,
        // AVGID = Avg Incident Duration
        weekendShoulderBlockageAVGID: 0,
        weekendOneLaneBlockageAVGID: 0,
        weekendTwoLaneBlockageAVGID: 0,
        weekendThreeLaneBlockageAVGID: 0,
        weekendFourLaneBlockageAVGID: 0,
        // ManIndt = Managed Incident
        weekendShoulderBlockageManIndt: 0,
        weekendOneLaneBlockageManIndt: 0,
        weekendTwoLaneBlockageManIndt: 0,
        weekendThreeLaneBlockageManIndt: 0,
        weekendFourLaneBlockageManIndt: 0,

  
        // INCIDENT DURATION & SAVINGS
        // Average Duration
        averageDurationSavings: 0,
        averageDurationActive: 'active',
        // By Lane Blockage
        shoulderBlockageSavings: 0,
        oneLaneBlockageSavings: 0,
        twoLaneBlockageSavings: 0,
        threeLaneBlockageSavings: 0,
        fourLaneBlockageSavings: 0,

        // WEATHER
        weatherRows: 1,
        firstWeather: 'Select Type',
        firstWeatherPrcnt: 0,
        firstWeatherState: 'visible',
        //--
        secondWeather: 'Select Type',
        secondWeatherPrcnt: 0,
        secondWeatherState: 'hidden',
        //--
        thirdWeather: 'Select Type',
        thirdWeatherPrcnt: 0,
        thirdWeatherState: 'hidden',
        //--
        fourthWeather: 'Select Type',
        fourthWeatherPrcnt: 0,
        fourthWeatherState: 'hidden',
        //--
        fifthWeather: 'Select Type',
        fifthWeatherPrcnt: 0,
        fifthWeatherState: 'hidden',
        //--
        sixthWeather: 'Select Type',
        sixthWeatherPrcnt: 0,
        sixthWeatherState: 'hidden',
        //--
        seventhWeather: 'Select Type',
        seventhWeatherPrcnt: 0,
        seventhWeatherState: 'hidden',
        //--

        // PERCENTAGE OF ESTIMATED SECONDARY INCIDENTS
        secondaryIncidentsPercentage: 0,

        // Calculations of Savings
        driverWage: 0,
        totalSegmentSaving: 0,
        totalSegmentSavingCar: 0,
        totalSegmentSavingTruck: 0,

        // For the project output page
        checked: 'checked',
        valid: false

      }//-- Segment

  });



  return Segment;

});
