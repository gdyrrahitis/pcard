import { getFirst, filterProp, filter, findIndex, reducer, removeFromIndexNumberOfItems } from "../../common/index";
export class ServerHandlers {
    constructor(private connections: Connection[], private socket: ISocket) { }

    private roomPrefix: string = "private-";
    private showAttendeesEvent: string = "show-attendees";
    private prefixWordWith = (word: string, prefix: string) => prefix.concat(word);

    disconnect = () => {
        let socketId = this.socket.id;
        let connection = this.popConnection("id", socketId);

        if (connection) {
            this.socket.server.to(this.prefixWordWith(connection.room, this.roomPrefix))
                .emit(this.showAttendeesEvent, this.connections);
        }
    }

    private popConnection(property: string, value: any) {
        let startIndex = findIndex(reducer(property)(value))(this.connections);
        return getFirst(removeFromIndexNumberOfItems<Connection>(startIndex, 1)(this.connections));
    }

    createPrivateRoom = (data, callback) => {
        var roomExistsAlreadyForOtherUser = getFirst(filter(filterProp(data.room)("room"))(this.connections));

        if (roomExistsAlreadyForOtherUser) {
            this.performActionAndNotifyUserForEvent("room-occupied", callback);
            return;
        }

        data.moderator = true;
        this.connectToRoom(data);
        this.socket.join("private-" + data.room);

        callback({ access: true });
        this.emitEventToRoom(data.room, "show-attendees", this.connections);
    }

    private performActionAndNotifyUserForEvent(event: string, callback: any) {
        callback({ access: false });
        this.socket.emit(event);
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
            moderator: data.moderator
        };
    }

    private bookToRoom(data) {
        this.socket.room = "room-" + data.room;
        this.connections[this.socket.room] = this.socket;
    }

    joinPrivateRoom = (data, callback) => {
        var doesRoomExist = getFirst(filter(filterProp(data.room)("room"))(this.connections));
        if (!doesRoomExist) {
            this.performActionAndNotifyUserForEvent("room-not-found", callback);
            return;
        }

        data.moderator = false;
        this.connectToRoom(data);
        this.socket.join("private-" + data.room);

        callback({ access: true });
        this.emitEventToRoom(data.room, "show-attendees", this.connections);
    }

    leavePrivateRoom = (data) => {
        let connection = this.popConnection("userId", data.id);

        if (connection) {
            this.emitEventToRoom(data.room, "show-attendees", this.connections);
        }
    }

    ban = (data) => {
        let connection = this.popConnection("userId", data.userId);

        if (connection) {
            this.socket.server.to(connection.id).emit("user-banned");
            this.emitEventToRoom(connection.room, "show-attendees", this.connections);
        }
    }

    getAllConnectedUsers = (room) => {
        this.emitEventToRoom(room, "show-attendees", this.connections);
    }
}