const rollupPlugins = [
	require('rollup-plugin-json')(),
	require('rollup-plugin-node-resolve')({ jsnext: true, main: true }),
	require('rollup-plugin-buble')()
]

if (process.env.COVERAGE) {
	rollupPlugins.push(
		require('rollup-plugin-istanbul')({
			exclude: [
				'../package.json',
				'../src/index.js',
				'./**/*.spec.js',
				'**/node_modules/**'
			],
			instrumenterConfig: {
				embedSource: true
			}
		})
	)
}

module.exports = function(karma) {
	karma.set({
		frameworks: ['mocha', 'sinon-chai'],

		preprocessors: {
			'./**/*.spec.js': ['rollup']
		},

		files: [{ pattern: './**/*.spec.js', watched: false }],

		rollupPreprocessor: {
			plugins: rollupPlugins,
			output: {
				format: 'iife',
				name: 'ScrollReveal',
				sourcemap: 'inline'
			}
		},

		colors: true,
		concurrency: 10,
		logLevel: karma.LOG_ERROR,
		singleRun: true,

		browserDisconnectTolerance: 1,
		browserDisconnectTimeout: 60 * 1000,
		browserNoActivityTimeout: 60 * 1000,
		// browserNoActivityTimeout: 60 * 1000 * 10 * 6, // dev tools debugging
		captureTimeout: 4 * 60 * 1000
	})

	if (process.env.TRAVIS) {
		if (process.env.COVERAGE) {
			karma.set({
				autoWatch: false,
				browsers: ['ChromeHeadless'],
				coverageReporter: {
					type: 'lcovonly',
					dir: 'coverage/'
				},
				reporters: ['mocha', 'coverage', 'coveralls']
			})
		} else {
			const customLaunchers = require('./sauce.conf')
			karma.set({
				autoWatch: false,
				browsers: Object.keys(customLaunchers),
				customLaunchers,
				reporters: ['dots', 'saucelabs'],
				hostname: 'localsauce',
				sauceLabs: {
					testName: 'ScrollReveal',
					build: process.env.TRAVIS_BUILD_NUMBER || 'manual',
					tunnelIdentifier: process.env.TRAVIS_BUILD_NUMBER || 'autoGeneratedTunnelID',
					recordVideo: true,
					connectOptions: {
						tunnelDomains: 'localsauce' // because Android 8 has an SSL error?
					}
				}
			})
		}
	} else {
		karma.set({
			browsers: ['ChromeHeadless'],
			// browsers: ['Chrome'], // dev tools debugging
			coverageReporter: {
				type: 'lcov',
				dir: '../.ignore/coverage/'
			},
			reporters: ['mocha', 'coverage']
		})
	}
}
