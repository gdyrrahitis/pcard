import * as uuidV1 from "uuid/v1";

import { getFirst, filter } from "../../shared/index";
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
                } catch (error) {
                    callback({ access: false });
                    this.emitInternalServerError(socket, error);
                }
            });

            let createRoom = (data, callback) => {
                if (this.hasRoomsReachedMaxLimit()) {
                    callback({ access: false });
                    socket.emit(RoomsFullEvent.eventName);
                    return;
                }

                let room = this.createRoom();
                this.rooms.push(room);

                this.createUser(socket.id, data.name)
                    .addToRoom(room)
                    .makeSocketJoinRoom(socket, room.id);

                let roomShowAllEvent = new RoomShowAllEvent(room.users);
                socket.server.to(room.id).emit(RoomShowAllEvent.eventName, roomShowAllEvent.users);

                callback({ access: true, roomId: room.id });

                this.emitRoomsAllEventWithTotalRooms();
                this.emitUsersAllEventWithTotalUsersInAllRooms();
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

                    if (this.isRoomEmpty(room)) {
                        this.removeRoomFromList(room);
                    }

                    callback();
                }
            }

            socket.on("room-join", (data, callback) => {
                try {
                    roomJoin(data, callback);
                } catch (error) {
                    callback({ access: false });
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomJoin = (data, callback) => {
                if (this.isUndefined(data)) {
                    throw new Error("Parameter data is required");
                }

                if (!data.roomId) {
                    throw new Error("Parameter <Object>.roomId is required");
                }

                if (!data.name) {
                    throw new Error("Parameter <Object>.name is required");
                }

                let room = getFirst(filter<Room>(r => r.id === data.roomId)(this.rooms));
                if (this.isUndefined(room)) {
                    callback({ access: false });
                    socket.emit(RoomNotFoundEvent.eventName);
                    return;
                }

                this.createUser(socket.id, data.name)
                    .addToRoom(room)
                    .makeSocketJoinRoom(socket, room.id);

                let roomShowAllEvent = new RoomShowAllEvent(room.users);
                socket.server.to(room.id).emit(RoomShowAllEvent.eventName, roomShowAllEvent.users);

                callback({ access: true });

                this.emitUsersAllEventWithTotalUsersInAllRooms();
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
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomGetAll = (data) => {
                if (this.isUndefined(data)) {
                    throw new Error("Parameter <Object>.roomId is required");
                }

                let room = getFirst(filter<Room>(r => r.id === data.roomId)(this.rooms));
                if (this.isUndefined(room)) {
                    throw new Error(`Could not find room '${data.roomId}'`);
                }

                let roomShowAllEvent = new RoomShowAllEvent(room.users);
                socket.server.to(room.id).emit(RoomShowAllEvent.eventName, roomShowAllEvent.users);
            }

            socket.on("request-all-rooms", () => this.emitRoomsAllEventWithTotalRooms());

            socket.on("request-all-users", () => this.emitUsersAllEventWithTotalUsersInAllRooms());
        });
    }

    private emitRoomsAllEventWithTotalRooms() {
        this.io.emit("rooms-all", this.rooms.length);
    }

    private emitUsersAllEventWithTotalUsersInAllRooms() {
        this.io.emit("users-all", this.rooms.length ? this.rooms.map(x => x.users.length).reduce((p, c, ) => p + c) : 0);
    }

    private isUndefined = (data: {}): boolean => {
        return typeof data === "undefined" || data === null;
    }

    private emitInternalServerError(socket: ISocket, error: any) {
        error.id = new uuidV1();
        let internalServerErrorEvent = new InternalServerErrorEvent(error);
        socket.emit(InternalServerErrorEvent.eventName, {
            id: internalServerErrorEvent.error.id,
            message: internalServerErrorEvent.error.message,
            name: internalServerErrorEvent.error.name
        });
    }

    private hasRoomsReachedMaxLimit(): boolean {
        return this.rooms.length >= max;
    }

    private isRoomEmpty(room: Room): boolean {
        return room.users.length === 0;
    }

    private removeRoomFromList = (room: Room) => {
        let index = this.rooms.findIndex((value) => value.id === room.id);
        this.rooms.splice(index, 1);
    }

    private createRoom(): Room {
        let roomId = uuidV1();
        return new Room(roomId);
    }

    private createUser(id: string, name: string): { addToRoom: (room: Room) => { makeSocketJoinRoom: (socket: ISocket, roomId: string) => void } } {
        return {
            addToRoom: (room: Room) => {
                return {
                    makeSocketJoinRoom: (socket: ISocket, roomId: string) => {
                        let user: User = { id: id, name: name };
                        room.addUser(user);
                        socket.join(roomId);
                    }
                }
            }
        }
    }
}