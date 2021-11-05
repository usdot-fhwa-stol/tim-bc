/* globals define */

define([
	'underscore',
	], function() {

		var DetailsValidateCTRL = function() {
    /****
      Validate Project Details Page
      ****/
    this.validateProjectDetails = function( project ) {
      var numOfSegments = project.get('numOfSegments');
      var studyP = project.get('studyPeriodDuration');
      var numOfIncidents = project.get('numOfIncidentsOnProgramRoadway');
      var annualCost = project.get('totalProgramCost');
      var valid = true;
      var errors = [];

      if( numOfSegments <= 0 || numOfSegments > 51 ) {
        valid = false;
        errors.push('#number_of_segments');
      }

      if( studyP <= 0 ) {
        valid = false;
        errors.push('#study_period_duration');
      }

      if( numOfIncidents <= 0 ) {
        valid = false;
        errors.push('#number_of_incidents_on_program_roadway');
      }

      if( annualCost <= 0 ) {
        valid = false;
        errors.push('#total_program_cost');
      }

      $('.details-input').parent().removeClass('has-error');

      if( valid ) {
        _.each( errors, function( err ) {
          $( err ).parent().removeClass('has-error');
        });
      } else {
        _.each( errors, function( err ) {
          $( err ).parent().addClass('has-error');
        });
      }

      return valid;
    };

    return this;
  };// End of CTRL

  return DetailsValidateCTRL;

});