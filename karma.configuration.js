var istanbul = require("browserify-istanbul");

var karmaConfig = {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["jasmine", "browserify"],

    // list of files / patterns to load in the browser
    files: [
      "node_modules/angular/angular.js",
      "node_modules/ngstorage/ngStorage.js",
      "node_modules/angular-mocks/angular-mocks.js",
      "node_modules/angular-sanitize/angular-sanitize.js",
      "node_modules/angular-route/angular-route.js",
      "node_modules/toastr/toastr.js",
      "node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js",
      { pattern: "src/client/client.config.json", watched: true, included: false, served: true },
      "src/client/**/*.js",
      "src/domain/**/*.js"
    ],
    
    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "src/**/*.js": ["browserify"]
    },

    browserify: {
      debug: true,
      plugin: ["babelify"],
      transform: [
        istanbul({
          instrumenter: require("isparta"),
          instrumenterConfig: { babel: { presets: ["es2015"], retainLines: true } },
          ignore: ["**/node_modules/**", "**/dist/**", "**/tasks/**", "**/typings/**", "**/index.ts"]
        })
      ]
    },

    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-browserify"),
      require("karma-mocha-reporter")
    ],

    // test results reporter to use
    // possible values: "dots", "progress"
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["mocha"],

    // web server port
    port: 9000,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    browsers: ["Chrome"],

    singleRun: true,

    autoWatch: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    coverageReporter: {
      includeAllSources: true,
      dir: "coverage/",
      reporters: [
        { type: "html", subdir: "html" },
        { type: "text-summary" }
      ]
    }
  };

module.exports = karmaConfig;
