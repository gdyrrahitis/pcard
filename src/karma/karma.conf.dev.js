require('babel-register');

var conf = require("../../karma.configuration");
conf.autoWatch = true;
conf.browsers = ["Chrome"];
conf.singleRun = false;

module.exports = conf;
