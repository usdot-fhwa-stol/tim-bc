/* globals define */

define(function( require ) {

	// Create the ROUND function as part of the Number class
	Number.prototype.round = function(places) {
    return +(Math.round(this + "e+" + places)  + "e-" + places);
  }

	// --------
	// TEST 1
	// --------
	describe('Interpolation Test 1', function() {

		describe('Testing getting Upper value of a given number.', function() {
			it('Upper should be equal to 5400 based on given 5331.40973715344 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 5331.40973715344);
				var upperValue = interpolate.getUpper('duration');
				upperValue.should.equal(5400);
			});
			it('Upper should be equal to 120 based on given 101.770048239268 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 101.770048239268);
				var upperValue = interpolate.getUpper('speed');
				upperValue.should.equal(120);
			});
			it('Upper should be equal to 1600 based on given 1503.63361535128 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 1503.63361535128);
				var upperValue = interpolate.getUpper('volume');
				upperValue.should.equal(1600);
			});
		});

		describe('Testing getting Lower value of a given number.', function() {
			it('Lower should be equal to 5100 based on given 5331.40973715344 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 5331.40973715344);
				var lowerValue = interpolate.getLower('duration');
				lowerValue.should.equal(5100);
			});
			it('Lower should be equal to 100 based on given 101.770048239268 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 101.770048239268);
				var lowerValue = interpolate.getLower('speed');
				lowerValue.should.equal(100);
			});
			it('Lower should be equal to 1400 based on given 1503.63361535128 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 1503.63361535128);
				var lowerValue = interpolate.getLower('volume');
				lowerValue.should.equal(1400);
			});
		});

		describe('Testing getting of Weights', function() {

			it('Weight for LLL should be equal to ' + Number(0.100413546579749).round(6), function() {
				var Interpolate = require('utilities/interpolation');
				var fuelConsumpt = require('resource/fuelConsumptionCar');
				//console.log(fuelConsumpt);
				var interpolate = new Interpolate;
				interpolate.setValues(5331.40973715344, 101.770048239268, 1503.63361535128);
				var weight = interpolate.calculateWeights();
				Number(weight.lll).round(6).should.equal( Number(0.100413546579749).round(6) );
			});
			it('Weight for LLU should be equal to ' + Number(0.107985983911686).round(6), function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(5331.40973715344, 101.770048239268, 1503.63361535128);
				var weight = interpolate.calculateWeights();
				Number(weight.llu).round(6).should.equal( Number(0.107985983911686).round(6) );
			});
			it('Weight for LUL should be equal to ' + Number(0.00974971429738132).round(6), function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(5331.40973715344, 101.770048239268, 1503.63361535128);
				var weight = interpolate.calculateWeights();
				Number(weight.lul).round(6).should.equal( Number(0.00974971429738132).round(6) );
			});
			it('Weight for LUU should be equal to 0.010484964699702', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(5331.40973715344, 101.770048239268, 1503.63361535128);
				var weight = interpolate.calculateWeights();
				Number(weight.luu).round(6).should.equal( Number(0.010484964699702).round(6) );
			});
			it('Weight for ULL should be equal to 0.33877508929581', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(5331.40973715344, 101.770048239268, 1503.63361535128);
				var weight = interpolate.calculateWeights();
				Number(weight.ull).round(6).should.equal( Number(0.33877508929581).round(6) );
			});
			it('Weight for ULU should be equal to 0.364322968249337', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(5331.40973715344, 101.770048239268, 1503.63361535128);
				var weight = interpolate.calculateWeights();
				Number(weight.ulu).round(6).should.equal( Number(0.364322968249337).round(6) );
			});
			it('Weight for UUL should be equal to 0.0328935730706489', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(5331.40973715344, 101.770048239268, 1503.63361535128);
				var weight = interpolate.calculateWeights();
				Number(weight.uul).round(6).should.equal( Number(0.0328935730706489).round(6) );
			});
			it('Weight for UUU should be equal to 0.0353741598956859', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(5331.40973715344, 101.770048239268, 1503.63361535128);
				var weight = interpolate.calculateWeights();
				Number(weight.uuu).round(6).should.equal( Number(0.0353741598956859).round(6) );
			});

		});

	});
	// - END --

	// --------
	// TEST 2
	// --------
	describe('Interpolation Test 2', function() {

		describe('Testing getting Upper value of a given number.', function() {
			it('Upper should be equal to 6900 based on given 6830.66295224823 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 6830.66295224823);
				var upperValue = interpolate.getUpper('duration');
				upperValue.should.equal(6900);
			});
			it('Upper should be equal to 100 based on given 98.2455039583147 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 98.2455039583147);
				var upperValue = interpolate.getUpper('speed');
				upperValue.should.equal(100);
			});
			it('Upper should be equal to 1400 based on given 1281.47477153689 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 1281.47477153689);
				var upperValue = interpolate.getUpper('volume');
				upperValue.should.equal(1400);
			});
		});

		describe('Testing getting Lower value of a given number.', function() {
			it('Lower should be equal to 6600 based on given 6830.66295224823 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 6830.66295224823);
				var lowerValue = interpolate.getLower('duration');
				lowerValue.should.equal(6600);
			});
			it('Lower should be equal to 90 based on given 98.2455039583147 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 98.2455039583147);
				var lowerValue = interpolate.getLower('speed');
				lowerValue.should.equal(90);
			});
			it('Lower should be equal to 1200 based on given 1281.47477153689 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 1281.47477153689);
				var lowerValue = interpolate.getLower('volume');
				lowerValue.should.equal(1200);
			});
		});

		describe('Testing getting of Weights', function() {

			it('Weight for LLL should be equal to 0.100413546579749', function() {
				var Interpolate = require('utilities/interpolation');
				var fuelConsumpt = require('resource/fuelConsumptionCar');
				//console.log(fuelConsumpt);
				var interpolate = new Interpolate;
				interpolate.setValues(6830.66295224823, 98.2455039583147, 1281.47477153689);
				var weight = interpolate.calculateWeights();
				Number(weight.lll).round(6).should.equal( Number(0.0240313013621211).round(6) );
			});
			it('Weight for LLU should be equal to 0.107985983911686', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(6830.66295224823, 98.2455039583147, 1281.47477153689);
				var weight = interpolate.calculateWeights();
				Number(weight.llu).round(6).should.equal( Number(0.0165192239120824).round(6) );
			});
			it('Weight for LUL should be equal to 0.112938522400132', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(6830.66295224823, 98.2455039583147, 1281.47477153689);
				var weight = interpolate.calculateWeights();
				Number(weight.lul).round(6).should.equal( Number(0.112938522400132).round(6) );
			});
			it('Weight for LUU should be equal to 0.0776344448315319', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(6830.66295224823, 98.2455039583147, 1281.47477153689);
				var weight = interpolate.calculateWeights();
				Number(weight.luu).round(6).should.equal( Number(0.0776344448315319).round(6) );
			});
			it('Weight for ULL should be equal to 0.0799447207270705', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(6830.66295224823, 98.2455039583147, 1281.47477153689);
				var weight = interpolate.calculateWeights();
				Number(weight.ull).round(6).should.equal( Number(0.0799447207270705).round(6) );
			});
			it('Weight for ULU should be equal to 0.0549543581672602', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(6830.66295224823, 98.2455039583147, 1281.47477153689);
				var weight = interpolate.calculateWeights();
				Number(weight.ulu).round(6).should.equal( Number(0.0549543581672602).round(6) );
			});
			it('Weight for UUL should be equal to 0.375711597826243', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(6830.66295224823, 98.2455039583147, 1281.47477153689);
				var weight = interpolate.calculateWeights();
				Number(weight.uul).round(6).should.equal( Number(0.375711597826243).round(6) );
			});
			it('Weight for UUU should be equal to 0.258265830773559', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(6830.66295224823, 98.2455039583147, 1281.47477153689);
				var weight = interpolate.calculateWeights();
				Number(weight.uuu).round(6).should.equal( Number(0.258265830773559).round(6) );
			});

		});

	});
	// - END --

	// --------
	// TEST 3
	// --------
	describe('Interpolation Test 3', function() {

		describe('Testing getting Upper value of a given number.', function() {
			it('Upper should be equal to 14400 based on given 14351.8934362889 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 14351.8934362889);
				var upperValue = interpolate.getUpper('duration');
				upperValue.should.equal(14400);
			});
			it('Upper should be equal to 70 based on given 68.9294016268104 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 68.9294016268104);
				var upperValue = interpolate.getUpper('speed');
				upperValue.should.equal(70);
			});
			it('Upper should be equal to 1600 based on given 1411.23203993775 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 1411.23203993775);
				var upperValue = interpolate.getUpper('volume');
				upperValue.should.equal(1600);
			});
		});

		describe('Testing getting Lower value of a given number.', function() {
			it('Lower should be equal to 12600 based on given 14351.8934362889 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 14351.8934362889);
				var lowerValue = interpolate.getLower('duration');
				lowerValue.should.equal(12600);
			});
			it('Lower should be equal to 60 based on given 68.9294016268104 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 68.9294016268104);
				var lowerValue = interpolate.getLower('speed');
				lowerValue.should.equal(60);
			});
			it('Lower should be equal to 1400 based on given 1411.23203993775 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 1411.23203993775);
				var lowerValue = interpolate.getLower('volume');
				lowerValue.should.equal(1400);
			});
		});

		describe('Testing getting of Weights', function() {

			it('Weight for LLL should be equal to 0.00270057782329636', function() {
				var Interpolate = require('utilities/interpolation');
				var fuelConsumpt = require('resource/fuelConsumptionCar');
				//console.log(fuelConsumpt);
				var interpolate = new Interpolate;
				interpolate.setValues(14351.8934362889, 68.9294016268104, 1411.23203993775);
				var weight = interpolate.calculateWeights();
				Number(weight.lll).round(6).should.equal( Number(0.00270057782329636).round(6) );
			});
			it('Weight for LLU should be equal to 0.000160689334971159', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(14351.8934362889, 68.9294016268104, 1411.23203993775);
				var weight = interpolate.calculateWeights();
				Number(weight.llu).round(6).should.equal( Number(0.000160689334971159).round(6) );
			});
			it('Weight for LUL should be equal to 0.0225243607804369', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(14351.8934362889, 68.9294016268104, 1411.23203993775);
				var weight = interpolate.calculateWeights();
				Number(weight.lul).round(6).should.equal( Number(0.0225243607804369).round(6) );
			});
			it('Weight for LUU should be equal to 0.00134024078966958', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(14351.8934362889, 68.9294016268104, 1411.23203993775);
				var weight = interpolate.calculateWeights();
				Number(weight.luu).round(6).should.equal( Number(0.00134024078966958).round(6) );
			});
			it('Weight for ULL should be equal to 0.0983467576531831', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(14351.8934362889, 68.9294016268104, 1411.23203993775);
				var weight = interpolate.calculateWeights();
				Number(weight.ull).round(6).should.equal( Number(0.0983467576531831).round(6) );
			});
			it('Weight for ULU should be equal to 0.00585181250750628', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(14351.8934362889, 68.9294016268104, 1411.23203993775);
				var weight = interpolate.calculateWeights();
				Number(weight.ulu).round(6).should.equal( Number(0.00585181250750628).round(6) );
			});
			it('Weight for UUL should be equal to 0.820268104054336', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(14351.8934362889, 68.9294016268104, 1411.23203993775);
				var weight = interpolate.calculateWeights();
				Number(weight.uul).round(6).should.equal( Number(0.820268104054336).round(6) );
			});
			it('Weight for UUU should be equal to 0.0488074570566005', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(14351.8934362889, 68.9294016268104, 1411.23203993775);
				var weight = interpolate.calculateWeights();
				Number(weight.uuu).round(6).should.equal( Number(0.0488074570566005).round(6) );
			});

		});

	});
	// - END --

	// --------
	// TEST 4
	// --------
	describe('Interpolation Test 4', function() {

		describe('Testing getting Upper value of a given number.', function() {
			it('Upper should be equal to 2700 based on given 2532.58849661238 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 2532.58849661238);
				var upperValue = interpolate.getUpper('duration');
				upperValue.should.equal(2700);
			});
			it('Upper should be equal to 90 based on given 80.6063668616116 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 80.6063668616116);
				var upperValue = interpolate.getUpper('speed');
				upperValue.should.equal(90);
			});
			it('Upper should be equal to 1000 based on given 794.450673204847 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 794.450673204847);
				var upperValue = interpolate.getUpper('volume');
				upperValue.should.equal(1000);
			});
		});

		describe('Testing getting Lower value of a given number.', function() {
			it('Lower should be equal to 2400 based on given 2532.58849661238 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 2532.58849661238);
				var lowerValue = interpolate.getLower('duration');
				lowerValue.should.equal(2400);
			});
			it('Lower should be equal to 80 based on given 80.6063668616116 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 80.6063668616116);
				var lowerValue = interpolate.getLower('speed');
				lowerValue.should.equal(80);
			});
			it('Lower should be equal to 500 based on given 794.450673204847 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 794.450673204847);
				var lowerValue = interpolate.getLower('volume');
				lowerValue.should.equal(500);
			});
		});

		describe('Testing getting of Weights', function() {

			it('Weight for LLL should be equal to 0.215498221983694', function() {
				var Interpolate = require('utilities/interpolation');
				var fuelConsumpt = require('resource/fuelConsumptionCar');
				//console.log(fuelConsumpt);
				var interpolate = new Interpolate;
				interpolate.setValues(2532.58849661238, 80.6063668616116, 794.450673204847);
				var weight = interpolate.calculateWeights();
				Number(weight.lll).round(6).should.equal( Number(0.215498221983694).round(6) );
			});
			it('Weight for LLU should be equal to 0.308702526672747', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(2532.58849661238, 80.6063668616116, 794.450673204847);
				var weight = interpolate.calculateWeights();
				Number(weight.llu).round(6).should.equal( Number(0.308702526672747).round(6) );
			});
			it('Weight for LUL should be equal to 0.0139105901435652', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(2532.58849661238, 80.6063668616116, 794.450673204847);
				var weight = interpolate.calculateWeights();
				Number(weight.lul).round(6).should.equal( Number(0.0139105901435652).round(6) );
			});
			it('Weight for LUU should be equal to 0.0199270058253777', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(2532.58849661238, 80.6063668616116, 794.450673204847);
				var weight = interpolate.calculateWeights();
				Number(weight.luu).round(6).should.equal( Number(0.0199270058253777).round(6) );
			});
			it('Weight for ULL should be equal to 0.170672771567582', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(2532.58849661238, 80.6063668616116, 794.450673204847);
				var weight = interpolate.calculateWeights();
				Number(weight.ull).round(6).should.equal( Number(0.170672771567582).round(6) );
			});
			it('Weight for ULU should be equal to 0.244489793614817', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(2532.58849661238, 80.6063668616116, 794.450673204847);
				var weight = interpolate.calculateWeights();
				Number(weight.ulu).round(6).should.equal( Number(0.244489793614817).round(6) );
			});
			it('Weight for UUL should be equal to 0.0110170698954658', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(2532.58849661238, 80.6063668616116, 794.450673204847);
				var weight = interpolate.calculateWeights();
				Number(weight.uul).round(6).should.equal( Number(0.0110170698954658).round(6) );
			});
			it('Weight for UUU should be equal to 0.0157820202967517', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(2532.58849661238, 80.6063668616116, 794.450673204847);
				var weight = interpolate.calculateWeights();
				Number(weight.uuu).round(6).should.equal( Number(0.0157820202967517).round(6) );
			});

		});

	});
	// - END --

	// --------
	// TEST 5
	// --------
	describe('Interpolation Test 5', function() {

		describe('Testing getting Upper value of a given number.', function() {
			it('Upper should be equal to 2100 based on given 2100 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 2100);
				var upperValue = interpolate.getUpper('duration');
				upperValue.should.equal(2100);
			});
			it('Upper should be equal to 100 based on given 94.0265154 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 94.0265154);
				var upperValue = interpolate.getUpper('speed');
				upperValue.should.equal(100);
			});
			it('Upper should be equal to 1400 based on given 1209.275963 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 1209.275963);
				var upperValue = interpolate.getUpper('volume');
				upperValue.should.equal(1400);
			});
		});

		describe('Testing getting Lower value of a given number.', function() {
			it('Lower should be equal to 2100 based on given 2100 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 2100);
				var lowerValue = interpolate.getLower('duration');
				lowerValue.should.equal(2100);
			});
			it('Lower should be equal to 90 based on given 94.0265154 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 94.0265154);
				var lowerValue = interpolate.getLower('speed');
				lowerValue.should.equal(90);
			});
			it('Lower should be equal to 1200 based on given 1209.275963 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 1209.275963);
				var lowerValue = interpolate.getLower('volume');
				lowerValue.should.equal(1200);
			});
		});

		describe('Testing getting of Weights', function() {

			it('Weight for LLL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var fuelConsumpt = require('resource/fuelConsumptionCar');
				//console.log(fuelConsumpt);
				var interpolate = new Interpolate;
				interpolate.setValues(2100, 94.0265154, 1209.275963);
				var weight = interpolate.calculateWeights();
				Number(weight.lll).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LLU should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(2100, 94.0265154, 1209.275963);
				var weight = interpolate.calculateWeights();
				Number(weight.llu).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LUL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(2100, 94.0265154, 1209.275963);
				var weight = interpolate.calculateWeights();
				Number(weight.lul).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LUU should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(2100, 94.0265154, 1209.275963);
				var weight = interpolate.calculateWeights();
				Number(weight.luu).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for ULL should be equal to 0.569643549', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(2100, 94.0265154, 1209.275963);
				var weight = interpolate.calculateWeights();
				Number(weight.ull).round(6).should.equal( Number(0.569643549).round(6) );
			});
			it('Weight for ULU should be equal to 0.02770491149', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(2100, 94.0265154, 1209.275963);
				var weight = interpolate.calculateWeights();
				Number(weight.ulu).round(6).should.equal( Number(0.02770491149).round(6) );
			});
			it('Weight for UUL should be equal to 0.3839766354', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(2100, 94.0265154, 1209.275963);
				var weight = interpolate.calculateWeights();
				Number(weight.uul).round(6).should.equal( Number(0.3839766354).round(6) );
			});
			it('Weight for UUU should be equal to 0.01867490418', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(2100, 94.0265154, 1209.275963);
				var weight = interpolate.calculateWeights();
				Number(weight.uuu).round(6).should.equal( Number(0.01867490418).round(6) );
			});

		});

	});
	// - END --

	// --------
	// TEST 6
	// --------
	describe('Interpolation Test 6', function() {

		describe('Testing getting Upper value of a given number.', function() {
			it('Upper should be equal to 1 based on given 1 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 1);
				var upperValue = interpolate.getUpper('duration');
				upperValue.should.equal(1);
			});
			it('Upper should be equal to 70 based on given 62.46967308 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 62.46967308);
				var upperValue = interpolate.getUpper('speed');
				upperValue.should.equal(70);
			});
			it('Upper should be equal to 1600 based on given 1462.559197 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 1462.559197);
				var upperValue = interpolate.getUpper('volume');
				upperValue.should.equal(1600);
			});
		});

		describe('Testing getting Lower value of a given number.', function() {
			it('Lower should be equal to 1 based on given 1 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 1);
				var lowerValue = interpolate.getLower('duration');
				lowerValue.should.equal(1);
			});
			it('Lower should be equal to 60 based on given 62.46967308 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 62.46967308);
				var lowerValue = interpolate.getLower('speed');
				lowerValue.should.equal(60);
			});
			it('Lower should be equal to 1400 based on given 1462.559197 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 1462.559197);
				var lowerValue = interpolate.getLower('volume');
				lowerValue.should.equal(1400);
			});
		});

		describe('Testing getting of Weights', function() {

			it('Weight for LLL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var fuelConsumpt = require('resource/fuelConsumptionCar');
				//console.log(fuelConsumpt);
				var interpolate = new Interpolate;
				interpolate.setValues(1, 62.46967308, 1462.559197);
				var weight = interpolate.calculateWeights();
				Number(weight.lll).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LLU should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(1, 62.46967308, 1462.559197);
				var weight = interpolate.calculateWeights();
				Number(weight.llu).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LUL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(1, 62.46967308, 1462.559197);
				var weight = interpolate.calculateWeights();
				Number(weight.lul).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LUU should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(1, 62.46967308, 1462.559197);
				var weight = interpolate.calculateWeights();
				Number(weight.luu).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for ULL should be equal to 0.5174870885', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(1, 62.46967308, 1462.559197);
				var weight = interpolate.calculateWeights();
				Number(weight.ull).round(6).should.equal( Number(0.5174870885).round(6) );
			});
			it('Weight for ULU should be equal to 0.2355456038', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(1, 62.46967308, 1462.559197);
				var weight = interpolate.calculateWeights();
				Number(weight.ulu).round(6).should.equal( Number(0.2355456038).round(6) );
			});
			it('Weight for UUL should be equal to 0.1697169251', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(1, 62.46967308, 1462.559197);
				var weight = interpolate.calculateWeights();
				Number(weight.uul).round(6).should.equal( Number(0.1697169251).round(6) );
			});
			it('Weight for UUU should be equal to 0.07725038264', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(1, 62.46967308, 1462.559197);
				var weight = interpolate.calculateWeights();
				Number(weight.uuu).round(6).should.equal( Number(0.07725038264).round(6) );
			});

		});

	});
	// - END --

	// --------
	// TEST 7
	// --------
	describe('Interpolation Test 7', function() {

		describe('Testing getting Upper value of a given number.', function() {
			it('Upper should be equal to 12600 based on given 12296.81052 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 12296.81052);
				var upperValue = interpolate.getUpper('duration');
				upperValue.should.equal(12600);
			});
			it('Upper should be equal to 120 based on given 120 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 120);
				var upperValue = interpolate.getUpper('speed');
				upperValue.should.equal(120);
			});
			it('Upper should be equal to 2200 based on given 2050.513636 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 2050.513636);
				var upperValue = interpolate.getUpper('volume');
				upperValue.should.equal(2200);
			});
		});

		describe('Testing getting Lower value of a given number.', function() {
			it('Lower should be equal to 10800 based on given 12296.81052 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 12296.81052);
				var lowerValue = interpolate.getLower('duration');
				lowerValue.should.equal(10800);
			});
			it('Lower should be equal to 120 based on given 120 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 120);
				var lowerValue = interpolate.getLower('speed');
				lowerValue.should.equal(120);
			});
			it('Lower should be equal to 2000 based on given 2050.513636 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 2050.513636);
				var lowerValue = interpolate.getLower('volume');
				lowerValue.should.equal(2000);
			});
		});

		describe('Testing getting of Weights', function() {

			it('Weight for LLL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var fuelConsumpt = require('resource/fuelConsumptionCar');
				//console.log(fuelConsumpt);
				var interpolate = new Interpolate;
				interpolate.setValues(12296.81052, 120, 2050.513636);
				var weight = interpolate.calculateWeights();
				Number(weight.lll).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LLU should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(12296.81052, 120, 2050.513636);
				var weight = interpolate.calculateWeights();
				Number(weight.llu).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LUL should be equal to 0.1258963688', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(12296.81052, 120, 2050.513636);
				var weight = interpolate.calculateWeights();
				Number(weight.lul).round(6).should.equal( Number(0.1258963688).round(6) );
			});
			it('Weight for LUU should be equal to 0.04254223054', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(12296.81052, 120, 2050.513636);
				var weight = interpolate.calculateWeights();
				Number(weight.luu).round(6).should.equal( Number(0.04254223054).round(6) );
			});
			it('Weight for ULL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(12296.81052, 120, 2050.513636);
				var weight = interpolate.calculateWeights();
				Number(weight.ull).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for ULU should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(12296.81052, 120, 2050.513636);
				var weight = interpolate.calculateWeights();
				Number(weight.ulu).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for UUL should be equal to 0.6215354508', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(12296.81052, 120, 2050.513636);
				var weight = interpolate.calculateWeights();
				Number(weight.uul).round(6).should.equal( Number(0.6215354508).round(6) );
			});
			it('Weight for UUU should be equal to 0.2100259499', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(12296.81052, 120, 2050.513636);
				var weight = interpolate.calculateWeights();
				Number(weight.uuu).round(6).should.equal( Number(0.2100259499).round(6) );
			});

		});

	});
	// - END --

	// --------
	// TEST 8
	// --------
	describe('Interpolation Test 8', function() {

		describe('Testing getting Upper value of a given number.', function() {
			it('Upper should be equal to 900 based on given 662.225158 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 662.225158);
				var upperValue = interpolate.getUpper('duration');
				upperValue.should.equal(900);
			});
			it('Upper should be equal to 90 based on given 90 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 90);
				var upperValue = interpolate.getUpper('speed');
				upperValue.should.equal(90);
			});
			it('Upper should be equal to 500 based on given 500 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 500);
				var upperValue = interpolate.getUpper('volume');
				upperValue.should.equal(500);
			});
		});

		describe('Testing getting Lower value of a given number.', function() {
			it('Lower should be equal to 600 based on given 662.225158 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 662.225158);
				var lowerValue = interpolate.getLower('duration');
				lowerValue.should.equal(600);
			});
			it('Lower should be equal to 90 based on given 90 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 90);
				var lowerValue = interpolate.getLower('speed');
				lowerValue.should.equal(90);
			});
			it('Lower should be equal to 500 based on given 500 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 500);
				var lowerValue = interpolate.getLower('volume');
				lowerValue.should.equal(500);
			});
		});

		describe('Testing getting of Weights', function() {

			it('Weight for LLL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var fuelConsumpt = require('resource/fuelConsumptionCar');
				//console.log(fuelConsumpt);
				var interpolate = new Interpolate;
				interpolate.setValues(662.225158, 90, 500);
				var weight = interpolate.calculateWeights();
				Number(weight.lll).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LLU should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(662.225158, 90, 500);
				var weight = interpolate.calculateWeights();
				Number(weight.llu).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LUL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(662.225158, 90, 500);
				var weight = interpolate.calculateWeights();
				Number(weight.lul).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LUU should be equal to 0.7925828066', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(662.225158, 90, 500);
				var weight = interpolate.calculateWeights();
				Number(weight.luu).round(6).should.equal( Number(0.7925828066).round(6) );
			});
			it('Weight for ULL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(662.225158, 90, 500);
				var weight = interpolate.calculateWeights();
				Number(weight.ull).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for ULU should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(662.225158, 90, 500);
				var weight = interpolate.calculateWeights();
				Number(weight.ulu).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for UUL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(662.225158, 90, 500);
				var weight = interpolate.calculateWeights();
				Number(weight.uul).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for UUU should be equal to 0.2074171934', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(662.225158, 90, 500);
				var weight = interpolate.calculateWeights();
				Number(weight.uuu).round(6).should.equal( Number(0.2074171934).round(6) );
			});

		});

	});
	// - END --

	// --------
	// TEST 9
	// --------
	describe('Interpolation Test 9', function() {

		describe('Testing getting Upper value of a given number.', function() {
			it('Upper should be equal to 5100 based on given 5100 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 5100);
				var upperValue = interpolate.getUpper('duration');
				upperValue.should.equal(5100);
			});
			it('Upper should be equal to 100 based on given 100 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 100);
				var upperValue = interpolate.getUpper('speed');
				upperValue.should.equal(100);
			});
			it('Upper should be equal to 1000 based on given 548.675134 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 548.675134);
				var upperValue = interpolate.getUpper('volume');
				upperValue.should.equal(1000);
			});
		});

		describe('Testing getting Lower value of a given number.', function() {
			it('Lower should be equal to 5100 based on given 5100 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 5100);
				var lowerValue = interpolate.getLower('duration');
				lowerValue.should.equal(5100);
			});
			it('Lower should be equal to 100 based on given 100 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 100);
				var lowerValue = interpolate.getLower('speed');
				lowerValue.should.equal(100);
			});
			it('Lower should be equal to 500 based on given 548.675134 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 548.675134);
				var lowerValue = interpolate.getLower('volume');
				lowerValue.should.equal(500);
			});
		});

		describe('Testing getting of Weights', function() {

			it('Weight for LLL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var fuelConsumpt = require('resource/fuelConsumptionCar');
				//console.log(fuelConsumpt);
				var interpolate = new Interpolate;
				interpolate.setValues(5100, 100, 548.675134);
				var weight = interpolate.calculateWeights();
				Number(weight.lll).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LLU should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(5100, 100, 548.675134);
				var weight = interpolate.calculateWeights();
				Number(weight.llu).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LUL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(5100, 100, 548.675134);
				var weight = interpolate.calculateWeights();
				Number(weight.lul).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LUU should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(5100, 100, 548.675134);
				var weight = interpolate.calculateWeights();
				Number(weight.luu).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for ULL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(5100, 100, 548.675134);
				var weight = interpolate.calculateWeights();
				Number(weight.ull).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for ULU should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(5100, 100, 548.675134);
				var weight = interpolate.calculateWeights();
				Number(weight.ulu).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for UUL should be equal to 0.902649732', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(5100, 100, 548.675134);
				var weight = interpolate.calculateWeights();
				Number(weight.uul).round(6).should.equal( Number(0.902649732).round(6) );
			});
			it('Weight for UUU should be equal to 0.09735026797', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(5100, 100, 548.675134);
				var weight = interpolate.calculateWeights();
				Number(weight.uuu).round(6).should.equal( Number(0.09735026797).round(6) );
			});

		});

	});
	// - END --

	// --------
	// TEST 10
	// --------
	describe('Interpolation Test 10', function() {

		describe('Testing getting Upper value of a given number.', function() {
			it('Upper should be equal to 10800 based on given 10800 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 10800);
				var upperValue = interpolate.getUpper('duration');
				upperValue.should.equal(10800);
			});
			it('Upper should be equal to 60 based on given 60 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 60);
				var upperValue = interpolate.getUpper('speed');
				upperValue.should.equal(60);
			});
			it('Upper should be equal to 2200 based on given 2200 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 2200);
				var upperValue = interpolate.getUpper('volume');
				upperValue.should.equal(2200);
			});
		});

		describe('Testing getting Lower value of a given number.', function() {
			it('Lower should be equal to 10800 based on given 10800 duration.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('duration', 10800);
				var lowerValue = interpolate.getLower('duration');
				lowerValue.should.equal(10800);
			});
			it('Lower should be equal to 60 based on given 60 speed.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('speed', 60);
				var lowerValue = interpolate.getLower('speed');
				lowerValue.should.equal(60);
			});
			it('Lower should be equal to 2200 based on given 2200 volume.', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.set('volume', 2200);
				var lowerValue = interpolate.getLower('volume');
				lowerValue.should.equal(2200);
			});
		});

		describe('Testing getting of Weights', function() {

			it('Weight for LLL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var fuelConsumpt = require('resource/fuelConsumptionCar');
				//console.log(fuelConsumpt);
				var interpolate = new Interpolate;
				interpolate.setValues(10800, 60, 2200);
				var weight = interpolate.calculateWeights();
				Number(weight.lll).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LLU should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(10800, 60, 2200);
				var weight = interpolate.calculateWeights();
				Number(weight.llu).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LUL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(10800, 60, 2200);
				var weight = interpolate.calculateWeights();
				Number(weight.lul).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for LUU should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(10800, 60, 2200);
				var weight = interpolate.calculateWeights();
				Number(weight.luu).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for ULL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(10800, 60, 2200);
				var weight = interpolate.calculateWeights();
				Number(weight.ull).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for ULU should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(10800, 60, 2200);
				var weight = interpolate.calculateWeights();
				Number(weight.ulu).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for UUL should be equal to 0', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(10800, 60, 2200);
				var weight = interpolate.calculateWeights();
				Number(weight.uul).round(6).should.equal( Number(0).round(6) );
			});
			it('Weight for UUU should be equal to 1', function() {
				var Interpolate = require('utilities/interpolation');
				var interpolate = new Interpolate;
				interpolate.setValues(10800, 60, 2200);
				var weight = interpolate.calculateWeights();
				Number(weight.uuu).round(6).should.equal( Number(1).round(6) );
			});

		});

	});
	// - END --

});