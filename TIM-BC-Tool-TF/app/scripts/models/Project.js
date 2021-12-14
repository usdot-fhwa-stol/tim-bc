/* globals define */

'use strict';

define([
  'backbone'
  ], function( Backbone ) {

    var Project = Backbone.Model.extend({
      defaults : {
          projectName : '',
          projectState : 'Alabama',
          totalProgramCost : 0,
          annualFixedCost: 0,
          programCostCalculations: [],
          studyPeriodDuration: 12,
          numOfIncidentsOnProgramRoadway : 0,
          numOfSegments: 1,
          segments: []
        }
    });

    return Project;

  });
