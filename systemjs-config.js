(function () {
    var map = {
        "bnc": "src",
        "angular": "node_modules/angular"
    };

    var packages = {
        "bnc": { main: "main.js", defaultExtension: "js" },
        "angular": { main: "index.js", defaultExtension: "js" }
    };

    var config = {
        map: map,
        packages: packages
    };
    System.config(config);
})();