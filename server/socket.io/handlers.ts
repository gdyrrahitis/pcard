import { getFirst, filterProp, filter, findIndex, reducer, removeFromIndexNumberOfItems } from "../../common/index";
export class ServerHandlers {
    constructor(private connections: Connection[], private socket: ISocket) { }

    private roomPrefix: string = "private-";
    private showAttendeesEvent: string = "show-attendees";
    private prefixWordWith = (word: string, prefix: string) => prefix.concat(word);

    disconnect = () => {
        let socketId = this.socket.id;
        let startIndex = findIndex(reducer("id")(socketId))(this.connections);
        let connection = getFirst(removeFromIndexNumberOfItems<Connection>(startIndex, 1)(this.connections));

        if (connection) {
            this.socket.server.to(this.prefixWordWith(connection.room, this.roomPrefix))
                .emit(this.showAttendeesEvent, this.connections);
        }
    }

    createPrivateRoom = (data, callback) => {
        var roomExistsAlreadyForOtherUser = getFirst(filter(filterProp(data.room)("room"))(this.connections));

        if (roomExistsAlreadyForOtherUser) {
            this.denyAccess(callback);
            return;
        }

        // No room found, book it
        this.connectToRoom(data);
        this.socket.join("private-" + data.room);

        callback({ access: true });
        this.emitEventToRoom(data.room, "show-attendees", this.connections);
    }

    private denyAccess(callback: any) {
        callback({ access: false });
        this.socket.emit("room-occupied");
    }

    private connectToRoom(data) {
        this.bookToRoom(data);
        var connection = this.createConnectionFrom(data);
        this.connections.push(connection);
    }

    private emitEventToRoom(room, event, data) {
        this.socket.server.to("private-" + room).emit(event, data);
    }

    private createConnectionFrom(data): Connection {
        return {
            id: this.socket.id,
            userId: data.userId,
            room: data.room,
            moderator: true
        };
    }

    private bookToRoom(data) {
        this.socket.room = "room-" + data.room;
        this.connections[this.socket.room] = this.socket;
    }

    joinPrivateRoom = (data, callback) => {
        var doesRoomExist = this.connections.filter(function (r) {
            return r.room === data.room;
        }).length > 0;
        if (!doesRoomExist) {
            callback({ access: false });
            this.socket.emit("room-not-found");
            return;
        }

        this.socket.room = "room-" + data.room;
        this.connections[this.socket.room] = this.socket;
        // No room found, book it
        var roomObj = {
            id: this.socket.id,
            userId: data.userId,
            room: data.room,
            moderator: false
        };
        this.connections.push(roomObj);
        this.socket.join("private-" + data.room);

        callback({ access: true });
        this.socket.server.to("private-" + data.room).emit("show-attendees", this.connections);
    }

    leavePrivateRoom = (data) => {
        var room = this.connections.filter(function (r) {
            return r.userId === data.id;
        })[0];
        this.connections = this.connections.filter(function (r) {
            return r.userId !== data.id;
        });
        console.log("Leaving room: " + JSON.stringify(room));

        if (room) {
            this.socket.server.to("private-" + room.room).emit("show-attendees", this.connections);
        }
    }

    ban = (data) => {
        var room = this.connections.filter(function (r) {
            return r.userId === data.userId;
        })[0];
        this.connections = this.connections.filter(function (r) {
            return r.userId !== data.userId;
        });

        if (room) {
            this.socket.server.to(room.id).emit("user-banned");
            this.socket.server.to("private-" + room.room).emit("show-attendees", this.connections);
        }
    }

    getAllConnectedUsers = (room) => {
        this.socket.server.to("private-" + room).emit("show-attendees", this.connections);
    }
}