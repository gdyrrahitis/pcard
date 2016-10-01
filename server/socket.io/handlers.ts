export class ServerHandlers {
    constructor(private rooms: any[], private socket: ISocket) { }

    disconnect = () => {
        var that = this;
        var room = this.rooms.filter(function (r) {
            return r.id === that.socket.id;
        })[0];
        this.rooms = this.rooms.filter(function (r) {
            return r.id !== that.socket.id;
        });

        if (room) {
            this.socket.server.to("private-" + room.room).emit("show-attendees", this.rooms);
        }
    }

    createPrivateRoom = (data, callback) => {
        // Is there any other user connected to this room?
        // If not, then this user is the moderator
        // Also block this room from creation by other users
        var roomExistsAlreadyForOtherUser = this.rooms.filter(function (r) {
            return r.room === data.room;
        }).length > 0;
        if (roomExistsAlreadyForOtherUser) {
            callback({ access: false });
            this.socket.emit("room-occupied");
            return;
        }

        this.socket.room = "room-" + data.room;
        this.rooms[this.socket.room] = this.socket;
        // No room found, book it
        var roomObj = {
            id: this.socket.id,
            userId: data.userId,
            room: data.room,
            moderator: true
        };
        this.rooms.push(roomObj);
        this.socket.join("private-" + data.room);

        callback({ access: true });
        this.socket.server.to("private-" + data.room).emit("show-attendees", this.rooms);
    }

    joinPrivateRoom = (data, callback) => {
        var doesRoomExist = this.rooms.filter(function (r) {
            return r.room === data.room;
        }).length > 0;
        if (!doesRoomExist) {
            callback({ access: false });
            this.socket.emit("room-not-found");
            return;
        }

        this.socket.room = "room-" + data.room;
        this.rooms[this.socket.room] = this.socket;
        // No room found, book it
        var roomObj = {
            id: this.socket.id,
            userId: data.userId,
            room: data.room,
            moderator: false
        };
        this.rooms.push(roomObj);
        this.socket.join("private-" + data.room);

        callback({ access: true });
        this.socket.server.to("private-" + data.room).emit("show-attendees", this.rooms);
    }

    leavePrivateRoom = (data) => {
        var room = this.rooms.filter(function (r) {
            return r.userId === data.id;
        })[0];
        this.rooms = this.rooms.filter(function (r) {
            return r.userId !== data.id;
        });
        console.log("Leaving room: " + JSON.stringify(room));

        if (room) {
            this.socket.server.to("private-" + room.room).emit("show-attendees", this.rooms);
        }
    }

    ban = (data) => {
        var room = this.rooms.filter(function (r) {
            return r.userId === data.userId;
        })[0];
        this.rooms = this.rooms.filter(function (r) {
            return r.userId !== data.userId;
        });

        if (room) {
            this.socket.server.to(room.id).emit("user-banned");
            this.socket.server.to("private-" + room.room).emit("show-attendees", this.rooms);
        }
    }

    getAllConnectedUsers = (room) => {
        this.socket.server.to("private-" + room).emit("show-attendees", this.rooms);
    }
}