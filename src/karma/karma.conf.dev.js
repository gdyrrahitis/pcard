require('babel-register');

var conf = require("../../karma.configuration");
conf.autoWatch = true;
conf.browsers = ["ChromeHeadless"];
conf.singleRun = false;

module.exports = conf;
