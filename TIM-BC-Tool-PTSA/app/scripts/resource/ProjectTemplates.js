/* globals define */

function ProjectTemplates() {
  /****
  ** GENERAL
  */
  this.NoProject = [
    '<div class="container center-text">',
      '<h1>Ooops! No Project found..</h1>',
      '<p>Avoid refreshing the page while working on a project or you\'ll lose all data.<br>Start a new Project or Upload Project Data.</p>',
      '<a href="#/project/new" class="btn btn-primary" tabindex="1"  style="display: block; margin: 40px auto; width: 180px;">',
      '<span class="glyphicon glyphicon-chevron-left"></span> Create Project</a>',
    '</div>'
  ].join('\n');

  this.NoSegment = [
    '<div class="container center-text">',
      '<h1>Ooops! No Segments Entered..</h1>',
      '<p>Go back to Project Details and enter the number of segments you are reporting.</p>',
      '<a href="#/project/details" class="btn btn-primary" tabindex="1"  style="display: block; margin: 40px auto; width: 180px;">',
      '<span class="glyphicon glyphicon-chevron-left"></span> Project Details</a>',
    '</div>'
  ].join('\n');

  /****
  ** SEGMENT INFORMATION
  */
  this.DefaultLaneBlockage = [
    '<tr class="peak-row shoulder">',
      '<td>Shoulder Blockage</td>',
      '<td><input type="text" class="form-control avg-incident-duration" tabindex="1"  data-peak="{{ peakName }}" data-lane="Shoulder" value="{{ shoulderBlockageAVGID }}"></td>',
      '<td><input type="text" class="form-control  num-of-managed-incidents" tabindex="1" data-peak="{{ peakName }}"  data-lane="Shoulder" value="{{ shoulderBlockageManIndt }}"></td>',
    '</tr>',
    '<tr class="peak-row first-lane">',
      '<td>One Lane Blockage</td>',
      '<td><input type="text" class="form-control avg-incident-duration" tabindex="1"  data-peak="{{ peakName }}" data-lane="OneLane" value="{{ firstBlockageAVGID }}"></td>',
      '<td><input type="text" class="form-control num-of-managed-incidents"  tabindex="1" data-peak="{{ peakName }}"  data-lane="OneLane" value="{{ firstBlockageManIndt }}"></td>',
    '</tr>'
  ].join('\n');

  this.TwoLaneBlockage = '<tr class="peak-row second-lane">' +
    '<td>Two Lane Blockage</td>' +
    '<td><input type="text" class="form-control avg-incident-duration" tabindex="1"   data-peak="{{ peakName }}" data-lane="TwoLane" value="{{ secondBlockageAVGID }}"></td>' +
    '<td><input type="text" class="form-control num-of-managed-incidents"  tabindex="1" data-peak="{{ peakName }}"  data-lane="TwoLane" value="{{ secondBlockageManIndt }}"></td>' +
  '</tr>';

  this.ThreeLaneBlockage = '<tr class="peak-row third-lane">' +
    '<td>Three Lane Blockage</td>' +
    '<td><input type="text" class="form-control avg-incident-duration" tabindex="1"  data-peak="{{ peakName }}" data-lane="ThreeLane" value="{{ thirdBlockageAVGID }}"></td>' +
    '<td><input type="text" class="form-control num-of-managed-incidents" tabindex="1"  data-peak="{{ peakName }}"  data-lane="ThreeLane" value="{{ thirdBlockageManIndt }}"></td>' +
  '</tr>';

  this.FourLaneBlockage = '<tr class="peak-row fourth-lane">' +
    '<td>Four Lane Blockage</td>' +
    '<td><input type="text" class="form-control avg-incident-duration"  tabindex="1" data-peak="{{ peakName }}" data-lane="FourLane" value="{{ fourthBlockageAVGID }}"></td>' +
    '<td><input type="text" class="form-control num-of-managed-incidents" tabindex="1"   data-peak="{{ peakName }}"  data-lane="FourLane" value="{{ fourthBlockageManIndt }}"></td>' +
  '</tr>';

  /* INCIDENT DURATION */
  this.DefaultLaneSavings = [
    '<div class="form-group clearfix margin-top-20 lane-savings-container">',
      '<label for="shoulder" class="control-label col-lg-6">SHOULDER BLOCKAGE:</label>',
      '<div class="col-lg-5">',
        '<input type="text" name="shoulder" tabindex="1"  id="shoulder_savings" class="form-control lane-savings" data-block="Shoulder" data-key="shoulderBlockageSavings" value="{{ shoulderBlockageSavings }}"></input>',
      '</div>',
    '</div>',

    '<div class="form-group clearfix margin-top-20 lane-savings-container">',
      '<label for="one_lane" class="control-label col-lg-6">ONE LANE BLOCKAGE:</label>',
      '<div class="col-lg-5">',
        '<input type="text" name="one_lane" tabindex="1"  id="one_lane_savings" class="form-control lane-savings" data-block="OneLane" data-key="oneLaneBlockageSavings" value="{{ oneLaneBlockageSavings }}"></input>',
      '</div>',
    '</div>'
  ].join('\n');

  this.TwoLaneSavings = [
    '<div class="form-group clearfix margin-top-20 lane-savings-container">',
      '<label for="two_lane_savings" class="control-label col-lg-6">TWO LANE BLOCKAGE:</label>',
      '<div class="col-lg-5">',
        '<input type="text" name="Two Lane Blockage" tabindex="1"  id="two_lane_savings" class="form-control lane-savings" data-block="TwoLane" data-key="twoLaneBlockageSavings" value="{{ twoLaneBlockageSavings }}"></input>',
      '</div>',
    '</div>'
  ].join('\n');

  this.ThreeLaneSavings = [
    '<div class="form-group clearfix margin-top-20 lane-savings-container">',
      '<label for="three_lane_savings" class="control-label col-lg-6">THREE LANE BLOCKAGE:</label>',
      '<div class="col-lg-5">',
        '<input type="text" name="Three Lane Blockage" tabindex="1"  id="three_lane_savings" class="form-control lane-savings" data-block="ThreeLane" data-key="threeLaneBlockageSavings" value="{{ threeLaneBlockageSavings }}"></input>',
      '</div>',
    '</div>'
  ].join('\n');

  this.FourLaneSavings = [
    '<div class="form-group clearfix margin-top-20 lane-savings-container">',
      '<label for="four_lane_savings" class="control-label col-lg-6">FOUR LANE BLOCKAGE:</label>',
      '<div class="col-lg-5">',
        '<input type="text" name="Three Lane Blockage" tabindex="1"  id="four_lane_savings" class="form-control lane-savings" data-block="FourLane" data-key="fourLaneBlockageSavings" value="{{ fourLaneBlockageSavings }}"></input>',
      '</div>',
    '</div>'
  ].join('\n');

  /****
  ** SSP OUTPUT
  */
  this.ListTemplate = [
    '<div class="checkbox" id="segment_{{ index }}">',
      '<div class="pull-right">',
        '<a href="#/project/segment/{{ index + 1 }}" tabindex="1"  class="edit-icon" title="Edit"><span class="glyphicon glyphicon-pencil"></span></a>',
        '<a href="#" class="delete-icon delete-segment" tabindex="1"  data-segment="{{ index }}" title="Delete"><span class="glyphicon glyphicon-trash"></span></a>',
      '</div>',
      '<label><input type="checkbox" data-index="{{ index }}" tabindex="1"  class="segment-checkbox" {{ segmentChecked }}> <span class="segment-name">{{ segmentName }}</span> </label>',
    '</div>'
  ].join('\n');

  this.WeatherTemplate = [ 
    '<tr data-index="{{ id }}">',
      '<td>',
        '<select name="Weather Information" id="weather_{{ id }}"  tabindex="1" class="form-control weather" value="{{ type }}">',
          '<option value="Clear">Clear</option>',
          '<option value="Light Rain">Light Rain</option>',
          '<option value="Heavy Rain">Heavy Rain</option>',
          '<option value="Light Snow">Light Snow</option>',
          '<option value="Snow">Snow</option>',
          '<option value="Fog">Fog</option>',
          '<option value="Icy Conditions">Icy Conditions</option>',
          '<option value="Low Visibility">Low Visilibity</option>',
          '<option value="Wind">Wind</option>',
        '</select>',
      '</td>',
      '<td class="percentage-wrapper">',
        '<input type="text" class="form-control percentage" tabindex="1"  value="{{ percentage }}">',
      '</td>',
    '</tr>'
  ].join('\n');


  return this;
  
}

define([], ProjectTemplates);