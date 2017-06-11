import * as uuidV1 from "uuid/v1";
import { Room, User } from "../../domain/index";
import {
    InternalServerErrorEvent, RoomsFullEvent, RoomShowAllEvent,
    RoomNotFoundEvent, UserBannedEvent, UserDisconnectedEvent
} from "../../domain/events/index";
const max: number = (<ServerAppConfig.ServerConfiguration>require("../server.config.json")).socketio.maxRoomsAllowed;

export class Socket {
    private rooms: Room[] = [];
    constructor(private io: SocketIO.Server) { }

    public connect() {
        this.io.on("connection", (socket: ISocket) => {
            socket.on("room-create", (data, callback) => {
                try {
                    createRoom(data, callback);
                    this.io.emit("rooms-all", this.rooms.length);

                    if (this.rooms.length) {
                        this.io.emit("users-all", this.rooms.map(x => x.users.length).reduce((p, c, ) => p + c));
                    }
                } catch (error) {
                    callback({ access: false });
                    let internalServerErrorEvent = new InternalServerErrorEvent(error);
                    socket.emit(InternalServerErrorEvent.eventName, internalServerErrorEvent.error);
                }
            });

            let createRoom = (data, callback) => {
                if (this.rooms.length >= max) {
                    callback({ access: false });
                    socket.emit(RoomsFullEvent.eventName);
                    return;
                }

                let user: User = { id: socket.id, name: data.name };
                let roomId = uuidV1();
                let room = new Room(roomId);
                room.addUser(user);

                socket.join(room.id);
                socket.room = room.id;

                let roomShowAllEvent = new RoomShowAllEvent(room.users);
                socket.server.to(room.id).emit(RoomShowAllEvent.eventName, roomShowAllEvent.users);

                this.rooms.push(room);
                callback({ access: true, roomId: roomId });
            }

            socket.on("room-disconnect", (data, callback) => {
                try {
                    disconnect(data, callback);
                    this.io.emit("rooms-all", this.rooms.length);
                    if (this.rooms.length) {
                        this.io.emit("users-all", this.rooms.map(x => x.users.length).reduce((p, c, ) => p + c));
                    }
                } catch (error) {
                    socket.emit(InternalServerErrorEvent.eventName, error);
                }
            });

            let disconnect = (data, callback) => {
                let room: Room = this.rooms.filter(r => r.id == data.roomId)[0];

                if (room) {
                    room.removeUser(data.userId);
                    let roomShowAllEvent = new RoomShowAllEvent(room.users);
                    socket.server.to(room.id).emit(RoomShowAllEvent.eventName, roomShowAllEvent.users);

                    let userDisconnectedEvent = new UserDisconnectedEvent(room.id);
                    socket.emit(UserDisconnectedEvent.eventName, userDisconnectedEvent.roomId);

                    if (isRoomEmpty(room)) {
                        removeRoomFromList(room);
                    }

                    callback();
                }
            }

            function isRoomEmpty(room: Room): boolean {
                return room.users.length === 0;
            }

            let removeRoomFromList = (room: Room) => {
                let index = this.rooms.findIndex((value) => value.id === room.id);
                this.rooms.splice(index, 1);
            }

            socket.on("room-join", (data, callback) => {
                try {
                    roomJoin(data, callback);
                    if (this.rooms.length) {
                        this.io.emit("users-all", this.rooms.map(x => x.users.length).reduce((p, c, ) => p + c));
                    }
                } catch (error) {
                    callback({ access: false });
                    socket.emit(InternalServerErrorEvent.eventName, error);
                }
            });

            let roomJoin = (data, callback) => {
                var room = this.rooms.filter(r => r.id == data.roomId)[0];
                if (!room) {
                    callback({ access: false });
                    socket.emit(RoomNotFoundEvent.eventName);
                    return;
                }

                let user: User = { id: socket.id, name: data.name };
                room.addUser(user);

                callback({ access: true });

                let roomShowAllEvent = new RoomShowAllEvent(room.users);
                socket.server.to(room.id).emit(RoomShowAllEvent.eventName, roomShowAllEvent.users);
                socket.room = room.id;
                socket.join(room.id);
            }

            socket.on("room-leave", (data) => {
                try {
                    roomLeave(data);
                    this.io.emit("rooms-all", this.rooms.length);
                    if (this.rooms.length) {
                        this.io.emit("users-all", this.rooms.map(x => x.users.length).reduce((p, c, ) => p + c));
                    }
                } catch (error) {
                    socket.emit(InternalServerErrorEvent.eventName, error);
                }
            });

            let roomLeave = (data) => {
                let room: Room = this.rooms.filter(r => r.id == data.roomId)[0];
                if (room) {
                    room.removeUser(data.userId);
                    let roomShowAllEvent = new RoomShowAllEvent(room.users);
                    socket.server.to(room.id).emit(RoomShowAllEvent.eventName, roomShowAllEvent.users);
                    if (room.users.length === 0) {
                        let index = this.rooms.findIndex((value) => value.id === room.id);
                        this.rooms.splice(index, 1);
                    }
                }
            }

            socket.on("ban", (data) => {
                try {
                    ban(data);
                    if (this.rooms.length) {
                        this.io.emit("users-all", this.rooms.map(x => x.users.length).reduce((p, c, ) => p + c));
                    }
                } catch (error) {
                    socket.emit(InternalServerErrorEvent.eventName, error);
                }
            });

            let ban = (data) => {
                let room = this.rooms.filter(r => r.id == data.roomId)[0];
                if (room) {
                    room.removeUser(data.userId);
                    this.io.to(data.userId).emit(UserBannedEvent.eventName);

                    let roomShowAllEvent = new RoomShowAllEvent(room.users);
                    socket.server.to(room.id).emit(RoomShowAllEvent.eventName, roomShowAllEvent.users);
                }
            }

            socket.on("room-get-all", (data) => {
                try {
                    roomGetAll(data);
                } catch (error) {
                    socket.emit(InternalServerErrorEvent.eventName, error);
                }
            });

            let roomGetAll = (data) => {
                let room = this.rooms.filter(r => r.id == data.roomId)[0];
                if (room) {
                    let roomShowAllEvent = new RoomShowAllEvent(room.users);
                    socket.server.to(room.id).emit(RoomShowAllEvent.eventName, roomShowAllEvent.users);
                }
            }

            socket.on("request-all-rooms", () => {
                this.io.emit("rooms-all", this.rooms.length);
            });

            socket.on("request-all-users", () => {
                if (this.rooms.length) {
                    this.io.emit("users-all", this.rooms.map(x => x.users.length).reduce((p, c, ) => p + c));
                }
            });
        });
    }
}