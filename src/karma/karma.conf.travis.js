require('babel-register');

var conf = require("../../karma.configuration");
conf.autoWatch = false;
conf.browsers = ['Chrome_travis_ci'];
conf.singleRun = true;
conf.customLaunchers = {
  Chrome_travis_ci: {
    base: 'Chrome',
    flags: ['--no-sandbox']
  }
};

module.exports = conf;
