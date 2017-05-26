// Karma configuration
// Generated on Sun Sep 18 2016 21:11:13 GMT+0100 (GMT Daylight Time)
var istanbul = require('browserify-istanbul')
require('babel-register');
module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'browserify'],


    // list of files / patterns to load in the browser
    files: [
      { pattern: 'node_modules/karma-jasmine-html-reporter/src/css/jasmine.css' },
      { pattern: 'node_modules/karma-jasmine-html-reporter/src/lib/html.jasmine.reporter.js' },
      { pattern: 'node_modules/karma-jasmine-html-reporter/src/lib/adapter.js' },
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      "node_modules/angular-sanitize/angular-sanitize.js",
      "node_modules/angular-route/angular-route.js",
      "node_modules/ngstorage/ngStorage.js",
      { pattern: 'src/client/client.config.json', watched: true, included: false, served: true },
      'src/client/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/*.js': ['browserify']
    },

    browserify: {
      debug: true,
      //plugin: ['tsify'],
      plugin: ['babelify'],
      transform: [
        istanbul({
          instrumenter: require('isparta'),
          instrumenterConfig: { babel: { presets: ["es2015"], retainLines: true } },
          ignore: ['**/node_modules/**', '**/dist/**', '**/tasks/**', '**/typings/**', '**/index.ts']
        }),
        //['babelify', { presets: ["es2015"], extensions: [".ts", ".js"], retainLines : true }]
      ]
    },

    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require('karma-browserify')
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9000,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    coverageReporter: {
      includeAllSources: true,
      dir: 'coverage/',
      reporters: [
        { type: "html", subdir: "html" },
        { type: 'text-summary' }
      ]
    }
  })
}
