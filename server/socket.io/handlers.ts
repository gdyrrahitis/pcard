import { getFirst, filterProp, filter, findIndex, reducer, removeFromIndexNumberOfItems } from "../../common/index";
export class ServerHandlers {
    constructor(private connections: Connection[], private socket: ISocket) { }

    private roomPrefix: string = "private-";
    // TODO: Make constants
    private showAttendeesEvent: string = "show-attendees";
    private roomOccupiedEvent: string = "room-occupied";
    private roomNotFoundEvent: string = "room-not-found";
    private userBannedEvent: string = "user-banned";

    disconnect = () => {
        let socketId = this.socket.id;
        let connection = this.getFirstConnectionBy("id", socketId);

        if (connection) {
            this.socket.server.to(this.prefixWordWith(connection.room, this.roomPrefix))
                .emit(this.showAttendeesEvent, this.connections);
        }
    }

    private getFirstConnectionBy(property: string, value: any) {
        let startIndex = findIndex(reducer(property)(value))(this.connections);
        return getFirst(removeFromIndexNumberOfItems<Connection>(startIndex, 1)(this.connections));
    }

    private prefixWordWith = (word: string, prefix: string) => prefix.concat(word);

    createPrivateRoom = (data, callback) => {
        var roomExistsAlreadyForOtherUser = getFirst(filter(filterProp(data.room)("room"))(this.connections));

        if (roomExistsAlreadyForOtherUser) {
            this.performActionAndNotifyUserForEvent(this.roomOccupiedEvent, callback);
            return;
        }

        data.moderator = true;
        this.connectToRoom(data);
        this.socket.join(this.prefixWordWith(data.room, this.roomPrefix));

        callback({ access: true });
        this.emitEventToRoom(data.room, this.showAttendeesEvent, this.connections);
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
        this.socket.server.to(this.prefixWordWith(room, this.roomPrefix)).emit(event, data);
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
            this.performActionAndNotifyUserForEvent(this.roomNotFoundEvent, callback);
            return;
        }

        data.moderator = false;
        this.connectToRoom(data);
        this.socket.join(this.prefixWordWith(data.room, this.roomPrefix));

        callback({ access: true });
        this.emitEventToRoom(data.room, this.showAttendeesEvent, this.connections);
    }

    leavePrivateRoom = (data) => {
        let connection = this.getFirstConnectionBy("userId", data.id);

        if (connection) {
            this.emitEventToRoom(data.room, this.showAttendeesEvent, this.connections);
        }
    }

    ban = (data) => {
        let connection = this.getFirstConnectionBy("userId", data.userId);

        if (connection) {
            this.socket.server.to(connection.id).emit(this.userBannedEvent);
            this.emitEventToRoom(connection.room, this.showAttendeesEvent, this.connections);
        }
    }

    getAllConnectedUsers = (room) => this.emitEventToRoom(room, this.showAttendeesEvent, this.connections);
}