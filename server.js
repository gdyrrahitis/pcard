var express = require("express"),
    path = require("path"),
    app = express(),
    server = require("http").Server(app),
    port = 54879;

app.use(express.static("src"));
app.use(express.static("node_modules"));
app.use(express.static("dist"));
app.use(express.static(__dirname));

app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', { root: __dirname });
});

server.listen(port, function () {
    console.log("Server is up and running, listening on port: " + port);
});
