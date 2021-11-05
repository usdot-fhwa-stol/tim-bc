/* globals define, GlobalEvent */

'use strict';

define([
  'backbone',
  'text!partials/Calculate.html',
  'text!resource/fuelPrices.json',
  'utilities/template'
  ], function( Backbone, CalculateHTML, FuelPrices, template ) {

    var CalculateView = Backbone.View.extend({

      el : '#calculate',

      template : template( CalculateHTML ),

      initialize : function() {
        // Add a global listener when calculate toggle is
        // called. This toggles the Module when triggered.
        GlobalEvent.on('toggle-calculate', this.toggle, this);
        //--
        GlobalEvent.on('calculate:open', this.open, this);
        // Listen to when overlay mask is closed and close
        // this Module as well.
        GlobalEvent.on('overlay-mask-closed', this.close, this);
        //--
        // Listen when state is changed and recalculate rows
        GlobalEvent.on('state:changed', this.recalculateAll, this);
        //--

        // Parse the string to a JSON object since requireJS'
        // text! doesn't do it by default.
        FuelPrices = JSON.parse( FuelPrices );
        //--
        // This holds the collection of Program Cost
        this.calculations = this.calculations || {};
        //--
        // Create local variables:
        // This counts how many rows are in the table
        this.tableRowCount = 1;
        //--
        // default 1 row, null by default because on keyup
        // within any input it will become an Object.
        //this.tableRows = [];
        //--
        // This defines the current row where the user is
        // typing, by default it's the first row
        this.currentRow = 1;
        //--
        // This will be our Annual Fixed Cost variable
        this.annualFixedCost = 0;
        //this.regex = new RegExp('^(?:\d+)?(?:\.)?(?:\d+)?$');
        //--
        // Cache the total calculation, either grab the
        // previous total or give it 0 if none.
        this.calculationTotal = 0;
        this.values = [];
      },

      events : {
        'click .calculate-closer' : 'toggle',
        'click #calculate-submit' : 'submitCalculation',
        'click #addRow' : 'addTableRow',
        'click .undo' : 'removeLastRow',
        'click input[type="text"]': 'selectInput',
        'keyup .table-row input[type="text"]': 'validateKeystroke',
        'blur .table-row input[type="text"]': 'numberify',
        'keyup #annual_fixed_cost': 'validateKeystroke',
        'blur #annual_fixed_cost': 'numberify'
      },
      // Check if an event is active and prevents
      // the default action and focuses on events
      // we developed for the trigger
      clearEvent: function( evnt ) {
        if( evnt ) {
          evnt.preventDefault();
        }
        return this;
      },
      // Toggles the opening and closing of the
      // Calculations component
      toggle : function( evnt ) {
        this.clearEvent( evnt );
        if( this.$el.hasClass('shut') ) {
          this.open();
        } else {
          this.close();
        }
        GlobalEvent.trigger('overlay-mask-toggle');
        return this;
      },
      // Closes this component
      close : function( evnt ) {
        this.clearEvent( evnt );
        this.$el.addClass('shut');
        this.$el.find('#calculate-table').css('display', 'none');
        return this;
      },
      // Open this component and loads values
      open : function( evnt ) {
        this.clearEvent( evnt );
        this.calculations = this.model.get('programCostCalculations') || {};
        this.tableRowCount = (this.calculations.length > 0) ? this.calculations.length : 1;
        this.loadValues();
        this.totalOfAllRows();
        this.$el.removeClass('shut');
        this.$el.find('#calculate-table').css('display', 'block');
        GlobalEvent.trigger('overlay-mask-open');
        // Focus on calculate-closer, this helps
        // with accessibility
        $('.calculate-closer').focus();
        return this;
      },
      // Selects the input value when clicked
      selectInput: function( evnt ) {
        $(evnt.currentTarget).select();
        return this;
      },
      // 
      addTableRow : function( evnt ) {
        this.clearEvent( evnt );

        var rowCount = ++this.tableRowCount;

        var newRow = '<tr class="table-row row-'+ rowCount +'" data-row="'+ rowCount +'">' + 
          '<td><input type="text" class="patrol-vehicle-type" value="" placeholder="Vehicle Type"></td>' +
          '<td><input type="text" class="number-of-vehicles" value="0"></td>' +
          '<td><input type="text" class="driver-salary" value="0"></td>' +
          '<td><input type="text" class="hours-per-day" value="0"></td>' +
          '<td><input type="text" class="days-per-month" value="0"></td>' +
          '<td><input type="text" class="fuel" value="0"></td>' +
          '<td><input type="text" class="provided-gas" value="0"></td>' +
          '<td><input type="text" class="vehicle-maintenance" value="0"></td>' +
          '<td><input type="text" class="other" value="0"></td>' +
          '<td><input type="text" class="row-total" value="$ 0"></td>' +
          '</tr>';

        var row = {
          vehicleType: '',
          numberOfVehicles: 0,
          driverSalary: 0,
          hoursPerDay: 0,
          daysPerMonth: 0,
          fuel: 0,
          providedGas: 0,
          vehicleMaintenance: 0,
          other: 0,
          total: 0,
        };

        this.calculations.push(row);
        console.log(this.calculations);
        $('.table.table-bordered').find('tbody').append( newRow );
        $('#undoAlert').fadeIn(400);

        return this;
      },

      removeLastRow : function( evnt ) {
        this.clearEvent( evnt );
        // Remove the last row in the table.
        $('.table.table-bordered').find('tbody').find('tr').filter(':last').remove();
        // Reduce the number of rows counted.
        this.tableRowCount--;
        // Remove pushed array element
        this.calculations.pop();
        // Hide UNDO if there is only 1 row.
        if( this.tableRowCount === 1 ) {
          $('.alert.alert-info').fadeOut(400);
          $('#addRow').focus();
        }
        // Recalculate total.
        this.totalOfAllRows();
        return this;
      },

      errorNaN: function(input, evnt) {
        this.clearEvent( evnt );
        alert('You entered an invalid number. Please use numbers for your calculations and enter 0 (Zero) if empty.');
        input.val( 0 ).focus();
        this.calculateAll( this.getRowValues( evnt ) );
        return this;
      },

      numberify: function(evnt) {
        this.clearEvent( evnt );
        var input = $(evnt.currentTarget);

        if( ! input.hasClass('patrol-vehicle-type') && ! input.hasClass('row-total') ) {
          if( ! isNaN( Number(input.val()) ) ) {
            input.val( Number( input.val() ).round(2) );
          } else {
            this.errorNaN(input, evnt);
          }
        }

        return this;
      },

      validateKeystroke: function( evnt ) {
        this.clearEvent( evnt );
        var input = $(evnt.currentTarget);
        if( evnt.keyCode === 190 ) {
          this.calculateAll( this.getRowValues( evnt ) );
        } else {
          if( input.hasClass('patrol-vehicle-type') || input.hasClass('row-total') ) {
            this.calculateAll( this.getRowValues( evnt ) );
          } else {
            if( ! isNaN( Number(input.val()) ) ) {
              this.calculateAll( this.getRowValues( evnt ) );
            } else {
              this.errorNaN(input, evnt);
            }
          }
        }

      },

      getInput: function( row, selector ) {
        return row.find(selector).val();
      },

      parseNumber: function( string, round ) {
        return Number( string ).round(round);
      },

      parseInput: function( row, selector ) {
        var input = this.getInput(row, selector);
        return this.parseNumber( input, 2 );
      },

      getRowValues: function( evnt ) {
        this.clearEvent( evnt );
        var row = $(evnt.currentTarget).closest('tr');

        var values = {
          rowNumber:          Number( row.data('row') ),
          vehicleType:        row.find('.patrol-vehicle-type').val(),
          numberOfVehicles:   this.parseNumber(this.getInput(row, '.number-of-vehicles'), 0),
          driverSalary:       this.parseInput(row, '.driver-salary'),
          fuel:               this.parseInput(row, '.fuel'),
          vehicleMaintenance: this.parseInput(row, '.vehicle-maintenance'),
          hoursPerDay:        this.parseInput(row, '.hours-per-day'),
          daysPerMonth:       this.parseNumber(this.getInput(row, '.days-per-month'), 0),
          providedGas:        this.parseInput(row, '.provided-gas'),
          other:              this.parseInput(row, '.other'),
          total:              0
        };

        return values;
      },

      addCalculation: function( values ) {
        this.calculations[ values.rowNumber - 1] = values;
        return this;
      },

      removeLastCalculation: function( evnt ) {
        this.clearEvent( evnt );
        this.calculations.pop();
        return this;
      },

      getRowTotal: function( values ) {
        // Get Fuel cost by state
        var fuelByState = Number( FuelPrices[this.model.get('projectState')] );
        // Get total cost of driver
        var salaryCost = values.driverSalary * values.hoursPerDay * values.daysPerMonth;
        // Calculate fuel cost by multiplying the gallons by price in the state
        var fuelCost = values.fuel * fuelByState;
        // Calculate total vehicle cost, maintenance and gas money
        var vehicleCost = values.vehicleMaintenance + values.providedGas;
        // Set the row total
        values.total = this.parseNumber((salaryCost + fuelCost + vehicleCost + values.other) * values.numberOfVehicles, 2);

        return this;
      },

      showRowTotal: function( values ) {
        var row = $('.row-' + values.rowNumber);
        var rowTotal = row.find('.row-total');
        rowTotal.val('$ ' + values.total );
        return this;
      },

      totalOfAllRows: function() {
        // define variables
        var totalOfAllRows, total, calculations;
        // Total of all rows' element
        totalOfAllRows = $('.total-of-all-rows').find('span');
        // get calculations
        calculations = this.calculations;
        // initialize total to zero
        total = 0;
        // get the sum of all rows' total
        for( var x = 0, len = calculations.length; x < len; x++ ) {
          if( calculations[x].total !== null ) {
            total += calculations[x].total;
          }
        }
        // make sure total calculation is a number
        if( isNaN(this.calculationTotal) ) {
          this.calculationTotal = 0;
        }
        // get the annual fixed cost
        this.annualFixedCost = this.parseNumber($('#annual_fixed_cost').val(), 2);

        // calculate grand total
        this.calculationTotal = ( total * 12 ) + this.annualFixedCost;
        // show grand total to the UI
        this.calculationTotal = this.calculationTotal.round(2)
        totalOfAllRows.text( '$ ' + this.calculationTotal );

        return this;
      },

      calculateAll: function( rowValues ) {
        this.addCalculation( rowValues );
        this.getRowTotal( rowValues );
        this.showRowTotal( rowValues );
        this.totalOfAllRows();
        window.calculations = this.calculations;
        return this;
      },

      submitCalculation: function(e) {
        e.preventDefault();
        if( isNaN( this.calculationTotal ) ) {
          alert('The Total Cost is NOT a Number. Calculations won\'t be submitted, verify calculations for error.');
        } else {
          this.model.set('totalProgramCost', this.calculationTotal);
          this.model.set('annualFixedCost', this.annualFixedCost);
          this.model.set('programCostCalculations', this.calculations);
          GlobalEvent.trigger('submit-calculation');
          this.close();
        }
        return this;
      },
      // Load values saved in a project file, otherwise
      // show basic empty table, and values.
      loadValues: function() {
        // Variables
        var rowNumber, row, calculations;
        var tbody = $('.table').find('tbody');
        // Empty table body
        tbody.html('');
        // Generate blank table row used when there is no
        // data saved
        var html = '<tr class="table-row row-1" data-row="1">' +
                    '<td><input type="text" class="patrol-vehicle-type" value="" placeholder="Vehicle Type"></td>' +
                    '<td><input type="text" class="number-of-vehicles" value="0"></td>' +
                    '<td><input type="text" class="driver-salary" value="0"></td>' +
                    '<td><input type="text" class="hours-per-day" value="0"></td>' +
                    '<td><input type="text" class="days-per-month" value="0"></td>' +
                    '<td><input type="text" class="fuel" value="0"></td>' +
                    '<td><input type="text" class="provided-gas" value="0"></td>' +
                    '<td><input type="text" class="vehicle-maintenance" value="0"></td>' +
                    '<td><input type="text" class="other" value="0"></td>' +
                    '<td><input type="text" class="row-total" value="$ 0" readonly="readonly"></td>' +
                  '</tr>';
        // Cache calculation to a variable
        calculations = this.calculations;
        // Check if there are no saved calculations and
        // load blank table row, otherwise load all saved
        // calculations
        if( calculations.length == 0 ) {
          tbody.html(html)
        } else {
          for( var x = 0, len = calculations.length; x < len; x++ ) {
            rowNumber = x + 1;
            row = calculations[x];
            html = '<tr class="table-row row-'+ rowNumber +'" data-row="'+ rowNumber +'">' +
                    '<td><input type="text" class="patrol-vehicle-type" value="'+ row.vehicleType +'" placeholder="Vehicle Type"></td>' +
                    '<td><input type="text" class="number-of-vehicles" value="'+ row.numberOfVehicles +'"></td>' +
                    '<td><input type="text" class="driver-salary" value="'+ row.driverSalary +'"></td>' +
                    '<td><input type="text" class="hours-per-day" value="'+ row.hoursPerDay +'"></td>' +
                    '<td><input type="text" class="days-per-month" value="'+ row.daysPerMonth +'"></td>' +
                    '<td><input type="text" class="fuel" value="'+ row.fuel +'"></td>' +
                    '<td><input type="text" class="provided-gas" value="'+ row.providedGas +'"></td>' +
                    '<td><input type="text" class="vehicle-maintenance" value="'+ row.vehicleMaintenance +'"></td>' +
                    '<td><input type="text" class="other" value="'+ row.other +'"></td>' +
                    '<td><input type="text" class="row-total" value="$ '+ row.total +'" readonly="readonly"></td>' +
                  '</tr>';
            tbody.append( html );
          }
        }
        // Set Annual Fixed Cost, or 0 if empty
        this.annualFixedCost = this.model.get('annualFixedCost') || 0;
        $('#annual_fixed_cost').val( this.annualFixedCost );
        return this;
      },

      render : function() {
        // Load our template/partial
        this.$el.html( this.template );
        return this;
      }

    });

    return CalculateView;

  });
