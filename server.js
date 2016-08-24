var express = require("express");
var path = require("path");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var port = 54879;
var rooms = [];
var maxRoomsAllowed = 1;

app.use(express.static("src"));
app.use(express.static("node_modules"));
app.use(express.static("dist"));
app.use(express.static(__dirname));

app.all('/*', function (req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', { root: __dirname });
});

// Socket.io configuration
io.on("connection", function (socket) {
    console.log("New connection made to server." + socket.id);

    // Disconnect socket
    socket.on("disconnect", function () {
        var room = rooms.filter(function (r) {
            return r.id === socket.id;
        })[0];
        rooms = rooms.filter(function (r) {
            return r.id !== socket.id;
        });

        if (room) {
            io.to("private-" + room.room).emit("show-attendees", rooms);
        }
    });

    // // Join room
    // socket.on("join", function(data) {
    //     var filtered = rooms.filter(function(r) {
    //         return r.room == data.room;
    //     });

    //     // if (filtered.length == 0) {
    //     // if(rooms.length >= maxRoomsAllowed) {
    //     //     io.to(socket.id).emit("all-rooms-occupied");
    //     //     return;
    //     // }
    //     console.log(rooms);
    //     rooms[data.room] = socket;
    //     console.log(socket);
    //     // No room found, book it
    //     var roomObj = {
    //         id: socket.id,
    //         room: data.room
    //     };
    //     rooms.push(roomObj);
    //     // io.to(socket.id).emit("room-access-granted", roomObj);
    //     // return;
    //     // }

    //     // // Room found, do nothing
    //     // io.to(socket.id).emit("room-occupied");
    // });

    socket.on("join-private", function (data) {

        socket.room = "room-" + data.room;
        rooms[socket.room] = socket;
        // No room found, book it
        var roomObj = {
            id: socket.id,
            userId: data.userId,
            room: data.room
        };
        rooms.push(roomObj);
        socket.join("private-" + data.room);

        console.log("Joined private room: " + data.room);
        io.to("private-" + data.room).emit("show-attendees", rooms);
    });

    socket.on("private-leave", function (data) {
        var room = rooms.filter(function (r) {
            return r.userId === data.id;
        })[0];
        rooms = rooms.filter(function (r) {
            return r.userId !== data.id;
        });
        console.log("Leaving room: " + JSON.stringify(room));

        if (room) {
            io.to("private-" + room.room).emit("show-attendees", rooms);
        }
    });

    socket.on("ban", function (data) {  
        var room = rooms.filter(function (r) {
            return r.userId === data.userId;
        })[0];
        rooms = rooms.filter(function (r) {
            return r.userId !== data.userId;
        });

        if(room) {
            console.log("Banning user on socket: " + room.id);
            io.to(room.id).emit("user-banned");
        }
    });

    socket.on("get-all-attendees", function (room) {
        io.to("private-" + room).emit("show-attendees", rooms);
    });
});

server.listen(port, function () {
    console.log("Server is up and running, listening on port: " + port);
});
