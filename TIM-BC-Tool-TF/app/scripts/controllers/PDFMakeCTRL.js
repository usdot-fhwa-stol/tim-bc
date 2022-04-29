/* globals define */

'use strict';

define(['underscore'], function() {

	var sspPDF = {

		getDate: function() {
			var date = new Date();
			var day = date.getDate();
			var mon = date.getMonth() + 1;
			var yea = date.getFullYear();

			return mon + '/' + day + '/' + yea;
		},



		getValues: function( project ) {
			var _this = this;
			var segments = project.get('segments');
			var values = {
				totalTravelDelayCar: 0,
				totalCarMoney: 0,
				totalTravelDelayTruck: 0,
				totalTruckMoney: 0,
				fuelConsumptionGallons: 0,
				fuelSavingsGallons: 0,
				fuelSavingsMoney: 0,
				totalSecondaryIncidents: 0,
				secondaryIncidentsSaving: 0,
			};

			var SEGMENT_LAYOUT = [];

			_.each( segments, function( segment, index ) {
				if( segment.get('checked') != false && segment.get('valid') != false ) {
					values.totalTravelDelayCar += Number( segment.get('totalSegmentSavingCar') ).round(4);
					var driverWage = segment.get('driverWage');
					values.totalCarMoney += values.totalTravelDelayCar * driverWage;
					values.totalTravelDelayTruck += Number( segment.get('totalSegmentSavingTruck') ).round(4);
					values.totalTruckMoney += values.totalTravelDelayTruck * 67;

					values.fuelConsumptionGallons += Number( segment.get('totalFuelConsumptionGallons') ).round(4);
					values.fuelSavingsGallons += Number( segment.get('totalFuelSavingsGallons') ).round(4);
					values.fuelSavingsMoney += Number( segment.get('totalFuelSavings') ).round(4);

					values.totalSecondaryIncidents += Number( segment.get('totalSegmentSecondaryIncidents') ).round(4);
					values.secondaryIncidentsSaving += values.totalSecondaryIncidents * 4736;

					// Build the segment layout
					var SEGMENT_PARTIAL = [
						{
							text: 'Results for Segment ' + ( index + 1 ),
							style: 'sspHeader'
						},
						{
							table: {
								widths: ['auto', 'auto'],
								headerRows: 1,
								body: [
									[{ text: 'Segment Information', colSpan: 2, style: 'tableHeader' }, {}],
									['Segment length (miles) ', { text: segment.get('segmentLength').toString() + ' miles', alignment: 'right' }],
									['Number of ramps', { text: segment.get('numberOfRamps'), alignment: 'right' }],
									['Number of traffic lanes by direction', { text: segment.get('numberOfTrafficLanesByDirection'), alignment: 'right' }],
									['General terrain', { text: segment.get('generalTerrain'), alignment: 'right' }],									
									['Horizontal curvature', { text: segment.get('horizontalCurvature'), alignment: 'right' }]
								]
							},
							margin: [30, 20]
						},
		   			{
		   				table: {
		   					widths: [100, 100],
		   					headerRows: 1,
		   					body: [
		   						[{ text: 'Segment Summary', colSpan: 2, style: 'tableHeader' }, {}],
		   						['Name', { text: segment.get('name'), alignment: 'right' }],
		   						['Region', { text: segment.get('region'), alignment: 'right' }],
		   						['Length', { text: segment.get('segmentLength').toString() + ' miles', alignment: 'right' }],
		   					]
		   				},
		   				margin: [30, 20]
		   			},
		   			{
		   				text: 'The first of the two below tables contains delay reduction, fuel savings, and reduction in secondary incidents.'
		   			},
		   			{
		   				table: {
		   					widths: ['auto', 'auto'],
		   					headerRows: 1,
		   					body: [
								[{ text: 'Total Segment Savings', colSpan: 2, style: 'tableHeader' }, {}],
								['Travel Delay of Passenger Vehicles', { text: segment.get('totalSegmentSavingCar').round(2).toString() + ' Vehicle Hours', alignment: 'right' }],
								['Travel Delay of Passenger Vehicles', { text: '$'+ (segment.get('totalSegmentSavingCar')*segment.get('driverWage')).round(2).toString() + ' Vehicle Dollars', alignment: 'right' }],
								['Travel Delay of Trucks', { text: segment.get('totalSegmentSavingTruck').round(2).toString() + ' Vehicle Hours', alignment: 'right' }],
								// summarizes total truck savings and monetize it by multiplying the hours by 67						   
								['Travel Delay of Trucks', { text: '$'+ (segment.get('totalSegmentSavingTruck')* 67).round(2).toString() + ' Vehicle Dollars', alignment: 'right' }],
								['Fuel Consumption of Passenger Vehicles', { text: segment.get('totalFuelSavingsGallons').round(2).toString() + ' Gallons', alignment: 'right' }],
								['Fuel Saving of Passenger Vehicles', { text: segment.get('totalFuelSavings').round(2).toString() + ' Dollars', alignment: 'right' }],
								['Secondary Incidents', { text: segment.get('totalSegmentSecondaryIncidents').round(4).toString(), alignment: 'right' }],	
								['Secondary Incidents', { text: '$'+(segment.get('totalSegmentSecondaryIncidents')* 4736).round(4).toString() +' Dollars', alignment: 'right' }],
		   					]
		   				},
		   				margin: [30, 20]
		   			},
		   			{
		   				text: 'The table below calculates emissions reductions based on the reduction in fuel consumption above.'
		   			},
		   			{
		   				table: {
		   					widths: ['auto', 'auto'],
		   					headerRows: 1,
		   					body: [
		   						[{ text: 'Emissions Reductions', colSpan: 2, style: 'tableHeader' }, {}],
		   						['Hydrocarbon (HC)', { text: segment.get('HCEmission').round(4).toString() + ' Metric Tons', alignment: 'right' }],
		   						['Carbon Monxide (CO)', { text: segment.get('COEmission').round(4).toString() + ' Metric Tons', alignment: 'right' }],
		   						['Nitrogen Oxide (Nox)', { text: segment.get('NOxEmission').round(4).toString() + ' Metric Tons', alignment: 'right' }],
		   						['Carbon Dioxide (CO2)', { text: segment.get('CO2Emission').round(4).toString() + ' Metric Tons', alignment: 'right' }],
		   						['Sulfur Oxide (SOx)', { text: segment.get('SOxEmission').round(4).toString() + ' Grams', alignment: 'right' }]
		   					]
		   				},
		   				margin: [30, 20]
		   			},
		   			//Added by Fang Zhou for adding Monetary conversion rates table on 09/15/2015
                    {
                        text: 'The table below lists the monetary equivalents and data sources.'
                    },
                    {
                        table: {
                            widths: ['auto', 'auto','auto','auto'],
                            headerRows: 1,
                            body: [
                                [{ text: 'Monetary Equivalents', colSpan: 4, style: 'tableHeader' }, {}, {}, {}],
                                ['Time (car)', {  text: '$' + segment.get('driverWage').round(2).toString() + ' per Hour' }, '2015', 'Standard Occupational Classification (http://www.bls.gov/soc)'],
                                ['Time (truck)', '$67 per Hour' , '2014', 'An Analysis of the Operational Costs of Trucking: 2014 Update'],
                                ['Fuel', { text: '$' + segment.get('fuelPrice').round(2).toString() + ' per Gallon' }, '2015', 'Gasoline and Diesel Fuel Update, U.S. Energy Information Administration (http://www.eia.gov/petroleum/gasdiesel)'],
                                ['Secondary Incidents', '$4736 per Unit', '2015', 'The Economic and Societal Impact of Motor Vehicle Crashes: 2010 (Revised), NHTSA']
                            ]
                        },
                        margin: [30, 20]
                    },
                    //Added end for adding Monetary conversion rates table on 09/15/2015
		   			{
		   				text: '',
							pageBreak: "after"
		   			}
					];

					SEGMENT_LAYOUT.push(SEGMENT_PARTIAL);
				}
			});

			return {
				values: values,
				segments: SEGMENT_LAYOUT
			}
		},

		generate : function( project ) {
			var _this = this;

			var PROJECT_NAME = project.get('projectName');
			var STATE = project.get('projectState');
			var NUMBER_OF_SEGMENTS = project.get('segments').length;
			var STUDY_PERIOD = project.get('studyPeriodDuration');

			var leidos = 'data:image/png;base64,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';

			var dd = {
		    pageSize: 'LETTER',
		    footer: function(currentPage) {
		    	return {
		    		columns: [
		    			{
		    				// FHWA Logo footer
		    				image: 'fhwaFooter',
		    				fit: [130, 130],
		    				margin: [40,0,0,0]
		    			},
		    			{
		    				// Page count
		    				text: currentPage.toString(), 
		    				alignment: 'right', 
		    				margin: [0,0,40,0] 
		    			}
	    			]
		    	};
		    },

		    content: [

		    	// First Page
	   			{
	   				text: 'TIM-TF B/C Tool Output\n' + PROJECT_NAME + '\n' + _this.getDate(),
	   				alignment: 'right'
	   			},

	        {
	            text: 'TIM Task Force Benefit/Cost Estimations Tool Output',
	            fontSize: 24,
	            alignment: 'justified',
	            margin: [50, 200, 50, 0],
	            color: '#5379A8',
	            width: 90
	        },

	        {
	            text: 'Project Name: ' + PROJECT_NAME,
	            fontSize: 18,
	            alignment: 'justified',
	            margin: [50, 30, 0, 0],
	        },

	        {
	            text: 'Date: ' + _this.getDate(),
	            fontSize: 18,
	            alignment: 'justified',
	            margin: [50, 10, 0, 0],
	   					pageBreak: 'after'
	        },
					
					// Next Page
	   			{
	   				text: 'TIM-TF B/C Tool Output\n' + PROJECT_NAME + '\n' + _this.getDate(),
	   				alignment: 'right',
	   				margin: [0, 0, 0, 40]
	   			},

	   			{
	   				text: 'Total Program Savings',
	   				style: 'sspHeader',
	   				margin: [0, 0, 0, 30]
	   			},

	   			{
	   				text: 'A program summary is provided below.'
	   			},

	   			{
	   				table: {
	   					widths: ['auto', 70],
	   					headerRows: 1,
	   					body: [
	   						[{ text: 'Program Summary', colSpan: 2, style: 'tableHeader' }, {}],
	   						['State', { text: STATE, alignment: 'right' }],
	   						['Number of Segments', { text: NUMBER_OF_SEGMENTS.toString(), alignment: 'right' }],
	   						['Study Period Duration (Months)', { text: STUDY_PERIOD.toString(), alignment: 'right' }],
	   						['Number of Annual Incidents on Program Roadway', { text: project.get('numOfIncidentsOnProgramRoadway').toString(), alignment: 'right' }],
	   						//Modified by Fang Zhou for adding "$" on 09/11/2015
	   						//['Annual Total Program Cost', { text: project.get('totalProgramCost').toString(), alignment: 'right' }]
	   						['Annual Total Program Cost', { text: '$' + project.get('totalProgramCost').toString(), alignment: 'right' }]
	   						//Modified end for adding "$" on 09/11/2015
	   					]
	   				},
	   				margin: [30, 20]
	   			},

	   			{
	   				text: 'The first of the two below tables contains delay reduction, fuel savings, and reduction in secondary incidents. The B/C ratio for the program can be found at the bottom of the table.'
	   			},

	   			{
	   				table: {
	   					widths: ['auto', 'auto'],
	   					headerRows: 1,
	   					body: [
							[{ text: 'Total Program Savings', colSpan: 2, style: 'tableHeader' }, {}],
							['Travel Delay of Passenger Vehicles', { text: _this.getValues( project ).values.totalTravelDelayCar.round(2).toString() + ' Vehicle Hours', alignment: 'right'}],
							['Travel Delay of Passenger Vehicles',  { text:'$' + _this.getValues( project ).values.totalCarMoney.round(2).toString() + ' Vehicle Dollars', alignment: 'right'}],
							['Travel Delay of Trucks', { text: _this.getValues( project ).values.totalTravelDelayTruck.round(2).toString() + ' Vehicle Hours', alignment: 'right'}],
							['Travel Delay of Trucks', { text: '$' + _this.getValues( project ).values.totalTruckMoney.round(2).toString() + ' Vehicle Dollars', alignment: 'right'}],
							['Fuel Saving of Passenger Vehicles', { text: _this.getValues( project ).values.fuelSavingsGallons.round(2).toString() + ' Gallons', alignment: 'right'}],
							['Fuel Saving of Passenger Vehicles', { text: '$' + _this.getValues( project ).values.fuelSavingsMoney.round(2).toString() + ' Dollars', alignment: 'right'}],
							['Secondary Incidents', { text: project.get('secondaryIncidents').round(2).toString(), alignment: 'right'}],
							['Secondary Incidents', { text: '$' + _this.getValues( project ).values.secondaryIncidentsSaving.round(2).toString() + ' Dollars', alignment: 'right'}],
							[{ text: 'Benefit Cost Ratio', fillColor: '#DDD' }, { text: project.get('benefitCostRatio').round(2).toString(), alignment: 'right', fillColor: '#DDD'}]
	   					]
	   				},
	   				margin: [30, 20]
	   			},

	   			{
	   				text: '*This B/C ratio calculation does not include emissions. They are calculated separately below. Please see Part III for a more in-depth explanation of factors not included in the B/C ratio calculation, but that would nonetheless increase its value if considered.'
	   			},

	   			{
	   				text: 'The table below calculates emissions reductions based on the reduction in fuel consumption above.',
	   				margin: [0,10,0,0]
	   			},

	   			{
	   				table: {
	   					widths: ['auto', 'auto'],
	   					headerRows: 1,
	   					body: [
	   						[{ text: 'Emissions Reductions', colSpan: 2, style: 'tableHeader' }, {}],
	   						['Hydrocarbon (HC)', { text: project.get('totalHCEmission').round(4).toString() + ' Metric Tons', alignment: 'right'}],
	   						['Carbon Monoxide (CO)', { text: project.get('totalCOEmission').round(4).toString() + ' Metric Tons', alignment: 'right'}],
	   						['Nitrogen Oxide (Nox)', { text: project.get('totalNOxEmission').round(4).toString() + ' Metric Tons', alignment: 'right'}],
	   						['Carbon Dioxide (CO2)', { text: project.get('totalCO2Emission').round(4).toString() + ' Metric Tons', alignment: 'right'}],
	   						['Sulfur Oxide (SOx)', { text: project.get('totalSOxEmission').round(4).toString() + ' Grams', alignment: 'right'}]
	   					]
	   				},
	   				margin: [30, 20],
	   				pageBreak: 'after'
	   			},

	   			_this.getValues(project).segments,

	   			{
	   				text: 'Additional Benefits',
	   				style: 'sspHeader'
	   			},

	   			{
	   				text:'Several important benefits that can be derived from a TIM-TF program are accounted for in the B/C ratio developed by the TIM-TF-BC Tool. The tool was purposefully developed to provide conservative, defensible estimates. This section outlines numerous additional benefits that have not been included in the B/C ratio, but that would increase its value if considered.',
					   margin: [0, 10, 50, 0]
	   			},

	   			{
	   				text: 'Emissions',
	   				style: 'bold'
	   			},

	   			{
	   				text: 'The B/C ratio calculation does not include emissions, however the TIM-TF-BC Tool does estimate reductions in HC, CO, NOx, and CO2 in metric tons and SOx in Grams based on the reduction in fuel consumption under “Total Program Savings” above. If monetary equivalents are available, the monetary equivalent of emissions savings can be added to the total benefits in dollars. By dividing this savings by the total costs, a new B/C estimate can be obtained that includes the value of emissions reductions.',
					   margin: [0, 10, 50, 0]
	   			},

	   			{
	   				text: 'Several of the emissions considered by the tool are greenhouse gases (GHGs). GHGs are measured qualitatively through the intensity of their effect on the earth\'s atmosphere. This intensity is determined by the GHG\'s global warming potential (GWP). CO2 is the globally accepted reference gas with a GWP of 1, and GWP is typically measured for 1, 20, 50, and 100-year time periods. In addition to being a measure of a GHG\'s effect on the atmosphere, GWPs are used to convert GHGs into carbon dioxide equivalents (CO2e). This allows for the use of an easy and standard unit for reporting quantities of GHGs being measured. With this in mind, one option might be to use carbon dioxide equivalents. The price of carbon on the carbon market can provide a potential source of monetary value.',
					   margin: [0, 10, 50, 0]
	   			},

	   			{
	   				text: 'Secondary Incidents',
	   				style: 'bold'
	   			},

	   			{
	   				text: 'The B/C ratio calculation only considers the monetary value of property damage that might be prevented in the event of a secondary incident due to the existence of a TIM-TF program. The B/C ratio would be expected to rise very significantly if the value of even one fatal or near-fatal incident were included. Additionally, the savings derived from avoiding congestion resulting from secondary incidents due to the TIM-TF program have not been included in estimating the savings from secondary incidents.  ',
					   margin: [0, 10, 50, 0]
	   			},

	   			{
	   				text: 'Administrative',
	   				style: 'bold'
	   			},

	   			{
	   				text: 'The B/C ratio calculation does not include the monetary costs and time incurred by the TIM-TF for investigating and documenting incidents. Savings related to insurance claims, disability, rehabilitation, attorney fees, and court costs associated with litigation resulting from secondary incidents that did not arise are additional sources of savings that have not been included in the B/C calculation.',
					   margin: [0, 10, 50, 0]
	   			},

	   			{
	   				text: 'Public Safety and Economic Effects',
	   				style: 'bold'
	   			},

	   			{
	   				text: 'With the assistance of the TIM-TF program, law enforcement personnel have additional time to spend on more urgent tasks. Through improvements in safety, as well as the knowledge that help is nearby, the public will have a greater sense of security and a feeling of political good will. Reduced congestion can also aid in the flow of goods across the nation\'s freeways, affecting the price of the goods and the economy more generally.',
					   margin: [0, 10, 50, 0]
	   			}

				],

				images: {
					fhwaFooter: 'data:image/png;base64,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UmVhZHlxyWU8AAADJmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMwMTQgNzkuMTU2Nzk3LCAyMDE0LzA4LzIwLTA5OjUzOjAyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNCAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTA3NDZCRjlEM0Y2MTFFNEI2RTlDRkExMkVCODI0NUIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTA3NDZCRkFEM0Y2MTFFNEI2RTlDRkExMkVCODI0NUIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFMDc0NkJGN0QzRjYxMUU0QjZFOUNGQTEyRUI4MjQ1QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFMDc0NkJGOEQzRjYxMUU0QjZFOUNGQTEyRUI4MjQ1QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkB9oMAAAEbDSURBVHja7J0JnFTVlf9vr+wgKqIIiiKKKygq4G5U1Ai4BOISwTVqErdJNBqdycw4rp9E/3HUxCWJikkMBo0aMyQuUdyICyKuoBEBV5RFkLW76fqf7+l7ituv36ulu6q7gTqfT0F3ddV799177u/s55alUqlPnXObymuNa2Wqra11y5YtcytWrHCrVq50Xy1d6r7++mu3Zk3DUKqqqlz37t311aVLF9e5c2f9uUOHDm5Do7Vr17ry8nJXVlbmSrR+ryNryFqWqF0TILK4TABwpfzQqTXuuHz5cvevf/3Lffzxx27evLnuyy8XKuCtWrUqp+93FODr0rWr26JXL9dvm23c1ltv7XbccUfXo0ePNp/NRx991M2fP9+dddZZrlOnhukEyH/729+6fv36uVGjRsV+j/n40+TJ7hOZk80228wdf/zxbsiQIRnvhcD485//7BYuXKj3qK+v1znYSeZi2PDhrqvMUXukBx54QIXXscce227GNHHiRLflllu6kSNHtpi3//jHP7rZ7812l15yqdtiiy30fdbppZde0ntsumlP/dxnn33uthH+hVc2VKB8//333ZQpU9y4cePcVlttlfP36urq3N133+122WUXt//+++t7t99+u9t8883d2LFjCz3MVZXyT00xAXClaHbvvP22e23GDDf3ww/dUtHyUv5vSMrKigrXsWNHVyGMADOUy++qA8k/KflgvUjUevkBybpWJmfxokVukbzenTVLr9GtWzfXv39/t/vuu7vddtvNbbLJJm2y4HPmzHHvvfeeAlIIgG+++aZbKQAfB38fffSRu+mmm1wX0WyPOPxwN+P1192dd97pxo8f70aMGJFRc545c6YCIRuLeQN833rrLTflb39z//Zv/6bCob0R88N6tRttTfjpbZkzeKulNPlPf3Kvvfaa+/a3vy1At2n6fXiA9fr888/1+bFkKisrXY28n0qlNlj1asmSJW6W7FH2ez4AyFy9IbwN4EHMEXNYU1NTjGHWVDZATWGJAb/91ttu6rNTVRKEVC6gB+B19GYs2otRyj9wyn5hcLK5GSRA6aqrG12Lz65avVpBhle1/H1XkRz77bef21XAsDXJJDnMbcTPaDwAXBw99thjrqtsiKuvuUbHfuRRR7krr7zSvfjiixkBkHsBfnvuuaf77ne/m37/3Xfecbfedpu79dZb3U9/+tM0EBvNmzdPhQ7aR0isAS/Gy5x+8skneo8+ffokjuGLL77QdQZo+SySu9wLsdAMZCPoevs1x63BPfi7rT2f+/LLL5X5w3t+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'
				},

				styles: {
	        sspHeader: {
	            fontSize: 18,
	            bold: true,
	            color: '#5379A8',
	            margin: [0, 0, 0, 20]
	        },
					header: {
						fontSize: 18,
						bold: true
					},
					bold: {
						fontSize: 13,
						bold: true,
						margin: [0, 15, 0, 10]
					},
					tableHeader: {
						fontSize: 14,
						color: 'white',
						fillColor: '#5379A8',
						bold: true
					}
				},
				defaultStyle: {
					columnGap: 20,
					color: '#333',
					fontSize: 11
				}
			}

			return pdfMake.createPdf(dd).download('TIM-TF-Report.pdf');
		}//--
	}

	return sspPDF;

});