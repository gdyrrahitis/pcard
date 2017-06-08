require('babel-register');

var conf = require("./karma.configuration");
conf.logLevel = "LOG_DEBUG";
conf.autoWatch = true;
conf.browsers = ["Chrome"];
conf.singleRun = false;

module.exports = conf;
