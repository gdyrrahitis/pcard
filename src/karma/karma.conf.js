var karmaConfig = require("../../karma.configuration");
require('babel-register');

module.exports = function (config) {
  karmaConfig.logLevel = config.LOG_DEBUG;
  config.set(karmaConfig);
};
