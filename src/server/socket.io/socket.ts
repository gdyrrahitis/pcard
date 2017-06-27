import * as uuidV1 from "uuid/v1";

import { getFirst, filter } from "../../shared/index";
import { Room, User, UserRole } from "../../domain/index";
import {
    InternalServerErrorEvent, RoomsFullEvent, RoomShowAllEvent,
    RoomNotFoundEvent, UserBannedEvent, UserDisconnectedEvent
} from "../../domain/events/index";
const max: number = (<ServerAppConfig.ServerConfiguration>require("../server.config.json")).socketio.maxRoomsAllowed;

const isUndefined = (data: {}): boolean => {
    return typeof data === "undefined" || data === null;
}
class Guard {
    static throwIfObjectUndefined(data: {}, message: string) {
        this.throwIfConditionIsTruthy(isUndefined(data), message);
    }

    private static throwIfConditionIsTruthy(condition: boolean, message: string) {
        if (condition) {
            throw new Error(message);
        }
    }

    static throwIfStringNotDefinedOrEmpty(value: string, message: string) {
        this.throwIfConditionIsTruthy(!value, message);
    }

    static validate(condition: boolean, message: string) {
        this.throwIfConditionIsTruthy(condition, message);
    }
}

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
                Guard.throwIfObjectUndefined(data, "Parameter data is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.name, "Parameter name is required");

                let isCurrentUserInAnyOtherRoom = this.rooms.filter(r => !!r.getUser(socket.id)).length > 0;
                Guard.validate(isCurrentUserInAnyOtherRoom, "You are already in another room");

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

                this.emitLoggedUsersToRoom(socket, room);

                callback({ access: true, roomId: room.id });

                this.emitRoomsAllEventWithTotalRooms();
                this.emitUsersAllEventWithTotalUsersInAllRooms();
            }

            socket.on("room-disconnect", (data, callback: Function) => {
                try {
                    disconnect(data, callback);
                } catch (error) {
                    this.emitInternalServerError(socket, error);
                }
            });

            let disconnect = (data, callback) => {
                Guard.throwIfObjectUndefined(data, "Parameter data is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, "Parameter <Object>.roomId is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.userId, "Parameter <Object>.userId is required");

                let room: Room = this.getRoomOrThrowCouldNotFind(data.roomId);
                let userDisconnectedEvent = new UserDisconnectedEvent(room.id);
                let user = room.getUser(data.userId);
                if (user.role.name === "moderator") {
                    room.users.forEach(u => room.removeUser(u.id));
                    socket.broadcast.to(room.id).emit(UserDisconnectedEvent.eventName, userDisconnectedEvent.roomId);
                    socket.emit(UserDisconnectedEvent.eventName, userDisconnectedEvent.roomId);
                } else {
                    room.removeUser(data.userId);
                    socket.emit(UserDisconnectedEvent.eventName, userDisconnectedEvent.roomId);
                    this.emitLoggedUsersToRoom(socket, room);
                }

                if (this.isRoomEmpty(room)) {
                    this.removeRoomFromList(room);
                }

                callback();

                this.emitRoomsAllEventWithTotalRooms();
                this.emitUsersAllEventWithTotalUsersInAllRooms();
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
                Guard.throwIfObjectUndefined(data, "Parameter data is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, "Parameter <Object>.roomId is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.name, "Parameter <Object>.name is required");

                let room: Room = this.getSingleRoomBy(r => r.id === data.roomId);
                if (isUndefined(room)) {
                    callback({ access: false });
                    socket.emit(RoomNotFoundEvent.eventName);
                    return;
                }

                this.createUser(socket.id, data.name)
                    .addToRoom(room)
                    .makeSocketJoinRoom(socket, room.id);

                this.emitLoggedUsersToRoom(socket, room);

                callback({ access: true });

                this.emitUsersAllEventWithTotalUsersInAllRooms();
            }

            socket.on("ban", (data) => {
                try {
                    ban(data);
                } catch (error) {
                    this.emitInternalServerError(socket, error);
                }
            });

            let ban = (data) => {
                Guard.throwIfObjectUndefined(data, "Parameter data is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, "Parameter <Object>.roomId is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.userId, "Parameter <Object>.userId is required");
                Guard.validate(data.userId === socket.id, "You cannot ban yourself");

                let room = this.getRoomOrThrowCouldNotFind(data.roomId);
                room.removeUser(data.userId);
                this.io.to(data.userId).emit(UserBannedEvent.eventName);
                this.emitLoggedUsersToRoom(socket, room);
                this.emitUsersAllEventWithTotalUsersInAllRooms();
            }

            socket.on("room-get-all", (data) => {
                try {
                    roomGetAll(data);
                } catch (error) {
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomGetAll = (data) => {
                Guard.throwIfObjectUndefined(data, "Parameter data is required");

                let room: Room = this.getRoomOrThrowCouldNotFind(data.roomId);
                this.emitLoggedUsersToRoom(socket, room);
            }

            socket.on("request-all-rooms", () => this.emitRoomsAllEventWithTotalRooms());
            socket.on("request-all-users", () => this.emitUsersAllEventWithTotalUsersInAllRooms());

            socket.on("room-busy", (data, callback?: Function) => {
                try {
                    roomBusy(data, callback);
                } catch (error) {
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomBusy = (data, callback?: Function) => {
                toggleRoomAccesibility(data, callback)(true);
            }

            let toggleRoomAccesibility = (data, callback?: Function): (isLocked: boolean) => void => {
                return (isLocked: boolean) => {
                    Guard.throwIfObjectUndefined(data, "Parameter data is required");
                    Guard.throwIfStringNotDefinedOrEmpty(data.roomId, "Parameter <Object>.roomId is required");

                    let room = this.getRoomOrThrowCouldNotFind(data.roomId);
                    let user = room.getUser(socket.id);
                    Guard.validate(user.role.name === "guest", `You do not have permission to lock room ${room.id}`);
                    room.setLock(isLocked);

                    if (callback) {
                        callback();
                    }
                }
            }

            socket.on("room-free", (data: any, callback?: Function) => {
                try {
                    roomFree(data, callback);
                } catch (error) {
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomFree = (data: any, callback?: Function) => {
                toggleRoomAccesibility(data, callback)(false);
            }

            socket.on("room-deck-card-associate", (data, callback: Function) => {
                try {
                    roomDeckCardAssociate(data, callback);
                } catch (error) {
                    callback({ associated: false });
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomDeckCardAssociate = (data: any, callback: Function) => {
                Guard.throwIfObjectUndefined(data, "Parameter data is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, "Parameter <Object>.roomId is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.userId, "Parameter <Object>.userId is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.cardId, "Parameter <Object>.cardId is required");

                let room = this.getRoomOrThrowCouldNotFind(data.roomId);
                let user = room.getUser(data.userId);
                Guard.throwIfObjectUndefined(user, `Could not find user '${data.userId}' to associate with card '${data.cardId}'`);

                let card = room.deck.getCard(data.cardId);
                room.associate(user.id)(card.name);

                callback({ associated: card.users.some(id => id === user.id) });
            }

            socket.on("room-deck-card-disassociate", (data, callback: Function) => {
                try {
                    roomDeckCardDisassociate(data, callback);
                } catch (error) {
                    callback({ disassociated: false });
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomDeckCardDisassociate = (data: any, callback: Function) => {
                Guard.throwIfObjectUndefined(data, "Parameter data is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, "Parameter <Object>.roomId is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.userId, "Parameter <Object>.userId is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.cardId, "Parameter <Object>.cardId is required");

                let room = this.getRoomOrThrowCouldNotFind(data.roomId);
                let user = room.getUser(data.userId);
                Guard.throwIfObjectUndefined(user, `Could not find user '${data.userId}' to disassociate with card '${data.cardId}'`);

                let card = room.deck.getCard(data.cardId);
                room.disassociate(user.id)(card.name);
                callback({ disassociated: !card.users.some(id => id === user.id) });
            }

            socket.on("room-deck-reset", (data: any, callback?: Function) => {
                try {
                    roomDeckReset(data, callback);
                } catch (error) {
                    error.id = uuidV1();
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomDeckReset = (data: any, callback?: Function) => {
                Guard.throwIfObjectUndefined(data, "Parameter data is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, "Parameter <Object>.roomId is required");

                let room = this.getRoomOrThrowCouldNotFind(data.roomId);
                Guard.validate(room.getUser(socket.id).role.name === "guest", "User does not have permission to reset deck");

                room.deck.reset();
                this.io.in(room.id).emit("room-deck-card-disassociate", { disassociated: true });

                if (room.deck.lock) {
                    room.deck.setLocked(false);
                    this.io.in(room.id).emit("room-hand-unlock");
                }

                if (callback) {
                    callback();
                }
            }

            socket.on("room-deck-lock", (data: any, callback?: Function) => {
                try {
                    roomDeckLock(data, callback);
                } catch (error) {
                    error.id = uuidV1();
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomDeckLock = (data: any, callback?: Function) => {
                Guard.throwIfObjectUndefined(data, "Parameter data is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, "Parameter <Object>.roomId is required");

                let room = this.getRoomOrThrowCouldNotFind(data.roomId);
                Guard.validate(room.getUser(socket.id).role.name === "guest", "User does not have permission to lock deck");

                room.deck.setLocked(true);
                this.io.in(room.id).emit("room-hand-lock");

                if (callback) {
                    callback();
                }
            }

            socket.on("room-deck-unlock", (data: any, callback?: Function) => {
                try {
                    roomDeckUnlock(data, callback);
                } catch (error) {
                    error.id = uuidV1();
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomDeckUnlock = (data: any, callback?: Function) => {
                Guard.throwIfObjectUndefined(data, "Parameter data is required");
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, "Parameter <Object>.roomId is required");

                let room = this.getRoomOrThrowCouldNotFind(data.roomId);
                Guard.validate(room.getUser(socket.id).role.name === "guest", "User does not have permission to lock deck");

                room.deck.setLocked(false);
                this.io.in(room.id).emit("room-hand-unlock");

                if (callback) {
                    callback();
                }
            }
        });
    }

    private emitRoomsAllEventWithTotalRooms() {
        this.io.emit("rooms-all", this.rooms.length);
    }

    private emitUsersAllEventWithTotalUsersInAllRooms() {
        this.io.emit("users-all", this.rooms.length ? this.rooms.map(x => x.users.length).reduce((p, c, ) => p + c) : 0);
    }

    private emitLoggedUsersToRoom(socket: ISocket, room: Room) {
        let roomShowAllEvent = new RoomShowAllEvent(room.users);
        socket.server.to(room.id).emit(RoomShowAllEvent.eventName, roomShowAllEvent.users);
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

    private removeRoomFromList(room: Room) {
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

    private getSingleRoomBy(predicate: Predicate<Room>) {
        return getFirst(filter<Room>(predicate)(this.rooms));
    }

    private getRoomOrThrowCouldNotFind(roomId) {
        let room: Room = this.getSingleRoomBy(r => r.id === roomId);
        if (isUndefined(room)) {
            throw new Error(`Could not find room '${roomId}'`);
        }
        return room;
    }
}