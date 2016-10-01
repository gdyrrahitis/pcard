(function () {
    var map = {
        "bnc": "src",
        "socket.io-client": "/socket.io/socket.io.js",
        "angular": "node_modules/angular",
        "ngSanitize": "node_modules/angular-sanitize",
        "ngRoute": "node_modules/angular-route",
        "ngStorage": "node_modules/ngstorage/",
        "json": "node_modules/systemjs-plugin-json/"
    };

    var packages = {
        "bnc": { main: "main.js", defaultExtension: "js" },
        "angular": { main: "index.js", defaultExtension: "js" },
        "ngSanitize": { main: "index.js", defaultExtension: "js" },
        "ngRoute": { main: "index.js", defaultExtension: "js" },
        "ngStorage": { main: "ngStorage.min.js", defaultExtension: "js" },
        "json": { main: "json.js", defaultExtension: "js" }
    };

    var config = {
        map: map,
        packages: packages
    };
    System.config(config);
})();