export class Socket {
    private rooms = [];
    private maxRoomsAllowed: number = 1;
    
    constructor(private io: any) { }

    connect() {
        let that = this;
        // Socket.io configuration
        that.io.on("connection", function (socket: any) {
            console.log("New connection made to server." + socket.id);

            // Disconnect socket
            socket.on("disconnect", function () {
                var room = that.rooms.filter(function (r) {
                    return r.id === socket.id;
                })[0];
                that.rooms = that.rooms.filter(function (r) {
                    return r.id !== socket.id;
                });

                if (room) {
                    that.io.to("private-" + room.room).emit("show-attendees", that.rooms);
                }
            });

            socket.on("create-private", function (data, callback) {
                console.log(JSON.stringify(arguments))
                console.log(arguments[1].toString())
                // Is there any other user connected to this room?
                // If not, then this user is the moderator
                // Also block this room from creation by other users
                var roomExistsAlreadyForOtherUser = that.rooms.filter(function (r) {
                    return r.room === data.room;
                }).length > 0;
                if (roomExistsAlreadyForOtherUser) {
                    callback({ access: false });
                    socket.emit("room-occupied");
                    return;
                }

                socket.room = "room-" + data.room;
                that.rooms[socket.room] = socket;
                // No room found, book it
                var roomObj = {
                    id: socket.id,
                    userId: data.userId,
                    room: data.room,
                    moderator: true
                };
                that.rooms.push(roomObj);
                socket.join("private-" + data.room);

                console.log("Created private room: " + data.room);
                callback({ access: true });
                console.log(callback.toString())
                that.io.to("private-" + data.room).emit("show-attendees", that.rooms);
            });

            socket.on("join-private", function (data, callback) {
                var doesRoomExist = that.rooms.filter(function (r) {
                    return r.room === data.room;
                }).length > 0;
                if (!doesRoomExist) {
                    callback({ access: false });
                    socket.emit("room-not-found");
                    return;
                }

                socket.room = "room-" + data.room;
                that.rooms[socket.room] = socket;
                // No room found, book it
                var roomObj = {
                    id: socket.id,
                    userId: data.userId,
                    room: data.room,
                    moderator: false
                };
                that.rooms.push(roomObj);
                socket.join("private-" + data.room);

                console.log("Joined private room: " + data.room);
                callback({ access: true });
                that.io.to("private-" + data.room).emit("show-attendees", that.rooms);
            });

            socket.on("private-leave", function (data) {
                var room = that.rooms.filter(function (r) {
                    return r.userId === data.id;
                })[0];
                that.rooms = that.rooms.filter(function (r) {
                    return r.userId !== data.id;
                });
                console.log("Leaving room: " + JSON.stringify(room));

                if (room) {
                    that.io.to("private-" + room.room).emit("show-attendees", that.rooms);
                }
            });

            socket.on("ban", function (data) {
                var room = that.rooms.filter(function (r) {
                    return r.userId === data.userId;
                })[0];
                that.rooms = that.rooms.filter(function (r) {
                    return r.userId !== data.userId;
                });

                if (room) {
                    console.log("Banning user on socket: " + room.id);
                    that.io.to(room.id).emit("user-banned");
                    that.io.to("private-" + room.room).emit("show-attendees", that.rooms);
                }
            });

            socket.on("get-all-attendees", function (room) {
                that.io.to("private-" + room).emit("show-attendees", that.rooms);
            });
        });
    }
}