require("babel-register");
var path = require("path"),
  istanbul = require("browserify-istanbul"),
  webpackConfig = require("./webpack.tests.js"),
  entry = path.resolve(webpackConfig.context || "", webpackConfig.entry);

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: ".",

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["jasmine", "karma-typescript"],

    // list of files / patterns to load in the browser
    files: [
      "node_modules/angular/angular.js",
      "node_modules/ngstorage/ngStorage.js",
      "node_modules/angular-mocks/angular-mocks.js",
      "node_modules/angular-sanitize/angular-sanitize.js",
      "node_modules/angular-ui-router/release/angular-ui-router.js",
      "node_modules/toastr/toastr.js",
      "node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js",
      { pattern: "src/app/client/app.config.json", watched: true, included: false, served: true },
      "src/**/*.html",
      "src/app/client/**/*.spec.js"
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "src/app/client/app.module.ts": ["webpack"],
      "src/app/client/**/*.spec.js": ["webpack"],
      "src/app/client/**/*.js": ["babel"],
      "dist/**/*.js": ["coverage"],
      "src/**/*.html": ["ng-html2js"]
    },

    babelPreprocessor: {
      options: {
        presets: ['es2015'],
        sourceMap: 'inline'
      },
      // filename: function (file) {
      //   return file.originalPath.replace(/\.js$/, '.es5.js');
      // },
      // sourceFileName: function (file) {
      //   return file.originalPath;
      // }
    },

    ngHtml2JsPreprocessor: {
      // If your build process changes the path to your templates,
      // use stripPrefix and prependPrefix to adjust it.
      //stripPrefix: "src/app/client/",
      //prependPrefix: "/base/",
      cacheIdFromPath: function (filePath) {
        var cacheId;
        var regex = /((?:(?:[a-zA-Z]+)|((?:[a-zA-Z]+)(?:\-[a-zA-Z]+))).html)/;
        if (regex.test(filePath)) {
          var path = regex.exec(filePath)[0];
          return "./" + path;
        }
        return filePath;
      }
    },

    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-mocha-reporter"),
      require("karma-coverage"),
      require("karma-ng-html2js-preprocessor"),
      require("karma-webpack"),
      require("karma-typescript"),
      require("karma-babel-preprocessor")
    ],

    webpack: webpackConfig,

    webpackMiddleware: {
      // webpack-dev-middleware configuration
    },

    // test results reporter to use
    // possible values: "dots", "progress"
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["progress"/*, "coverage"*/],

    // web server port
    port: 9000,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

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
  });
};
