/* globals define */

define([], function() {

	var Interpolate = function() {

		this.values = {
			duration: 0,
			speed: 0,
			volume: 0
		};

		this.arrDuration = [
			1, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700,
			3000, 3300, 3600, 3900, 4200, 4500, 4800, 5100, 5400, 5700,
			6000, 6300, 6600, 6900, 7200, 9000, 10800, 12600, 14400
		];

		this.arrSpeed = [
			60, 70, 80, 90, 100, 120
		];

		this.arrVolume = [
			500, 1000, 1200, 1400, 1600, 1800, 2000, 2200
		];

		this.selectArray = function( type ){
			var _this = this;
			type = type || 'duration';
			if( type.toLowerCase() === 'duration' ) {
				return _this.arrDuration;
			} else if( type.toLowerCase() === 'speed' ) {
				return _this.arrSpeed;
			} else if( type.toLowerCase() === 'volume' ) {
				return _this.arrVolume;
			}
		};

		this.set = function( type, value ) {
			var _this = this;
			_this.values = _this.values || {};
			if( typeof type === 'string' && typeof value === 'number' ) {
				type = type.toLowerCase();
				if( type === 'duration' ) {
					if( value >= 1 && value <= 14400 ) {
						_this.values.duration = value;
					} else {
						GlobalEvent.trigger('interpolation:error');
						throw 'Error: Duration should be between 1 - 14400.';
					}
				} else if( type === 'speed' ) {
					if( value >= 60 && value <= 120 ) {
						_this.values.speed = value;
					} else {
						if( value < 60 ) {
							_this.values.speed = 60;
							GlobalEvent.trigger('interpolation:error', { type: 'speed'});
						} else if( value > 120 ) {
							_this.values.speed = 120;
							GlobalEvent.trigger('interpolation:error', { type: 'speed'});
						}
						//throw 'Error: Speed should be between 60 - 120.'
					}
				} else if( type === 'volume' ) {
					if( value >= 500 && value <= 2200 ) {
						_this.values.volume = value;
					} else {
						_this.values.volume = 500;
						//throw 'Error: Volume should be between 500 - 2200.';
					}
				} else {
					throw 'Error: Invalid "type" or undefined.';
				}
			} else if( typeof type !== 'string' ) {
				throw 'Error: Please enter string "type" first, e.g. "duration", and then enter a number "value".';
			}
		};

		this.get = function( type ) {
			var _this = this;
			if( typeof type === 'string' ) {
				type = type.toLowerCase();
				if( type === 'duration' ) {
					return _this.values.duration;
				} else if( type === 'speed' ) {
					return _this.values.speed;
				} else if( type === 'volume' ) {
					return _this.values.volume;
				} else {
					return 'Error: Invalid "type" or undefined.';
				}
			} else if( typeof type !== 'string' ) {
				return 'Error: Please enter string "type", e.g. "duration".';
			}
		};

		this.setValues = function( dur, spd, vol ) {
			this.set( 'duration', dur );
			this.set( 'speed', spd );
			this.set( 'volume', vol );

			return this;
		};

		this.getUpper = function( type ) {
			var _this = this;
			var arr = _this.selectArray( type );
			var value = _this.get( type );
			if( typeof value === 'number' ) {
				for( var i=0, len=arr.length; i < len; i++ ) {
					if( value <= arr[i]) return arr[i];
				}
			} else {
				throw 'Error: ' + type + ' given is not a number.';
			}
		};

		this.getLower = function( type ) {
			var _this = this;
			var arr = _this.selectArray( type );
			var value = _this.get( type );
			if( typeof value === 'number' ) {
				for( var i=arr.length, len=0; i >= len; i-- ) {
					if( value >= arr[i]) return arr[i];
				}
			} else {
				throw 'Error: ' + type + ' given is not a number.';
			}
		};

		// This function calculates the weights.
		// These are the diagonally opposing volume proportions.
		this.calculateWeights = function() {
			var _this = this;

			// Initialize our weight object
			_this.weights = _this.weights || {};

			// Create objects for each attribute
			var duration = {
				value: _this.get('duration'),
				upper: _this.getUpper('duration'),
				lower: _this.getLower('duration')
			}
			var speed = {
				value: _this.get('speed'),
				upper: _this.getUpper('speed'),
				lower: _this.getLower('speed')
			}
			var volume = {
				value: _this.get('volume'),
				upper: _this.getUpper('volume'),
				lower: _this.getLower('volume')
			}

			// Normalizing equal uppers and lowers
			if( duration.upper === duration.lower ) duration.lower--;
			if( speed.upper === speed.lower ) speed.lower--;
			if( volume.upper === volume.lower ) volume.lower--;

			if( typeof duration.value ==='number' && typeof speed.value ==='number' && typeof volume.value ==='number' ) {
				_this.weights = {
					lll: (duration.upper - duration.value) * (speed.upper - speed.value) * (volume.upper - volume.value) / (duration.upper - duration.lower) / (speed.upper - speed.lower) / (volume.upper - volume.lower),
				  llu: (duration.upper - duration.value) * (speed.upper - speed.value) * (volume.value - volume.lower) / (duration.upper - duration.lower) / (speed.upper - speed.lower) / (volume.upper - volume.lower),
				  lul: (duration.upper - duration.value) * (speed.value - speed.lower) * (volume.upper - volume.value) / (duration.upper - duration.lower) / (speed.upper - speed.lower) / (volume.upper - volume.lower),
				  luu: (duration.upper - duration.value) * (speed.value - speed.lower) * (volume.value - volume.lower) / (duration.upper - duration.lower) / (speed.upper - speed.lower) / (volume.upper - volume.lower),
				  ull: (duration.value - duration.lower) * (speed.upper - speed.value) * (volume.upper - volume.value) / (duration.upper - duration.lower) / (speed.upper - speed.lower) / (volume.upper - volume.lower),
				  ulu: (duration.value - duration.lower) * (speed.upper - speed.value) * (volume.value - volume.lower) / (duration.upper - duration.lower) / (speed.upper - speed.lower) / (volume.upper - volume.lower),
				  uul: (duration.value - duration.lower) * (speed.value - speed.lower) * (volume.upper - volume.value) / (duration.upper - duration.lower) / (speed.upper - speed.lower) / (volume.upper - volume.lower),
				  uuu: (duration.value - duration.lower) * (speed.value - speed.lower) * (volume.value - volume.lower) / (duration.upper - duration.lower) / (speed.upper - speed.lower) / (volume.upper - volume.lower)
				};
			} else {
				throw 'Error: Undefined or invalid attribute.'
			}

			return _this.weights;
		};

	};

	return Interpolate;

});