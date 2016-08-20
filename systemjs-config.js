(function () {
    var map = {
        "bnc": "src",
        "angular": "node_modules/angular",
        "ngSanitize": "node_modules/angular-sanitize",
        "ngRoute": "node_modules/angular-route"
    };

    var packages = {
        "bnc": { main: "main.js", defaultExtension: "js" },
        "angular": { main: "index.js", defaultExtension: "js" },
        "ngSanitize": { main: "index.js", defaultExtension: "js" },
        "ngRoute": { main: "index.js", defaultExtension: "js" }
    };

    var config = {
        map: map,
        packages: packages
    };
    System.config(config);
})();