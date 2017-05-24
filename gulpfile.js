(function () {
    var gulp = require("gulp"),
        requireDir = require("require-dir");

    requireDir("./src/tasks", { recurse: true });
})();