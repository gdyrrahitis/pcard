import * as uuidV1 from "uuid/v1";

import { Constants } from "./constants";
import { getFirst, filter, isUndefined, Guard } from "../../shared/index";
import { Room, User, UserRole, Roles } from "../../domain/index";
import {
    InternalServerErrorEvent, RoomsFullEvent, RoomShowAllEvent, RoomDisconnectEvent,
    RoomNotFoundEvent, UserBannedEvent, UserDisconnectedEvent, RoomCreateEvent,
    BanEvent, RequestAllRoomsEvent, RequestAllUsersEvent, RoomGetAllEvent,
    RoomJoinEvent, RoomsAllEvent, UsersAllEvent, ConnectionEvent
} from "../../domain/events/index";
const max: number = (<ServerAppConfig.ServerConfiguration>require("../server.config.json")).socketio.maxRoomsAllowed;

export class Socket {
    private rooms: Room[] = [];
    constructor(private io: SocketIO.Server) { }

    public connect() {
        this.io.on(ConnectionEvent.eventName, (socket: ISocket) => {
            socket.on(RoomCreateEvent.eventName, (data: CreateRoomEventArgs, callback: CreateRoomEventCallback) => {
                try {
                    createRoom(data, callback);
                } catch (error) {
                    callback({ access: false });
                    this.emitInternalServerError(socket, error);
                }
            });

            let createRoom = (data: CreateRoomEventArgs, callback: CreateRoomEventCallback) => {
                Guard.throwIfObjectUndefined(data, Constants.dataIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.name, Constants.dataNameIsRequired);

                let isCurrentUserInAnyOtherRoom = this.rooms.filter(r => !!r.getUser(socket.id)).length > 0;
                Guard.validate(isCurrentUserInAnyOtherRoom, Constants.youAreAlreadyInAnotherRoom);

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

            socket.on(RoomDisconnectEvent.eventName, (data: RoomDisconnectEventArgs, callback: Function) => {
                try {
                    disconnect(data, callback);
                } catch (error) {
                    this.emitInternalServerError(socket, error);
                }
            });

            let disconnect = (data: RoomDisconnectEventArgs, callback: Function) => {
                Guard.throwIfObjectUndefined(data, Constants.dataIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, Constants.dataRoomIdIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.userId, Constants.dataUserIdIsRequired);

                let room: Room = this.getRoomOrThrowCouldNotFind(data.roomId);
                let userDisconnectedEvent = new UserDisconnectedEvent(room.id);
                let user = room.getUser(data.userId);
                if (user.role.name === Roles.Moderator.toString()) {
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

            socket.on(RoomJoinEvent.eventName, (data: RoomJoinEventArgs, callback: RoomJoinCallback) => {
                try {
                    roomJoin(data, callback);
                } catch (error) {
                    callback({ access: false });
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomJoin = (data: RoomJoinEventArgs, callback: RoomJoinCallback) => {
                Guard.throwIfObjectUndefined(data, Constants.dataIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, Constants.dataRoomIdIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.name, Constants.dataNameIsRequired);

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

            socket.on(BanEvent.eventName, (data: BanEventArgs) => {
                try {
                    ban(data);
                } catch (error) {
                    this.emitInternalServerError(socket, error);
                }
            });

            let ban = (data: BanEventArgs) => {
                Guard.throwIfObjectUndefined(data, Constants.dataIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, Constants.dataRoomIdIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.userId, Constants.dataUserIdIsRequired);
                Guard.validate(data.userId === socket.id, Constants.youCannotBanYourself);

                let room = this.getRoomOrThrowCouldNotFind(data.roomId);
                room.removeUser(data.userId);
                this.io.to(data.userId).emit(UserBannedEvent.eventName);
                this.emitLoggedUsersToRoom(socket, room);
                this.emitUsersAllEventWithTotalUsersInAllRooms();
            }

            socket.on(RoomGetAllEvent.eventName, (data: RoomGetAllEventArgs) => {
                try {
                    roomGetAll(data);
                } catch (error) {
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomGetAll = (data: RoomGetAllEventArgs) => {
                Guard.throwIfObjectUndefined(data, Constants.dataIsRequired);

                let room: Room = this.getRoomOrThrowCouldNotFind(data.roomId);
                this.emitLoggedUsersToRoom(socket, room);
            }

            socket.on(RequestAllRoomsEvent.eventName, () => this.emitRoomsAllEventWithTotalRooms());
            socket.on(RequestAllUsersEvent.eventName, () => this.emitUsersAllEventWithTotalUsersInAllRooms());

            socket.on("room-busy", (data: RoomBusyEventArgs, callback?: Function) => {
                try {
                    roomBusy(data, callback);
                } catch (error) {
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomBusy = (data: RoomBusyEventArgs, callback?: Function) => {
                toggleRoomAccesibility(data, callback)(true);
            }

            let toggleRoomAccesibility = (data: RoomBusyEventArgs, callback?: Function): (isLocked: boolean) => void => {
                return (isLocked: boolean) => {
                    Guard.throwIfObjectUndefined(data, Constants.dataIsRequired);
                    Guard.throwIfStringNotDefinedOrEmpty(data.roomId, Constants.dataRoomIdIsRequired);

                    let room = this.getRoomOrThrowCouldNotFind(data.roomId);
                    let user = room.getUser(socket.id);
                    Guard.validate(user.role.name === Roles.Guest.toString(), `You do not have permission to lock room ${room.id}`);
                    room.setLock(isLocked);

                    if (callback) {
                        callback();
                    }
                }
            }

            socket.on("room-free", (data: RoomFreeEventArgs, callback?: Function) => {
                try {
                    roomFree(data, callback);
                } catch (error) {
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomFree = (data: RoomFreeEventArgs, callback?: Function) => {
                toggleRoomAccesibility(data, callback)(false);
            }

            socket.on("room-deck-card-associate", (data: RoomDeckCardAssociateEventArgs, callback: RoomDeckCardAssociateCallback) => {
                try {
                    roomDeckCardAssociate(data, callback);
                } catch (error) {
                    callback({ associated: false });
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomDeckCardAssociate = (data: RoomDeckCardAssociateEventArgs, callback: RoomDeckCardAssociateCallback) => {
                Guard.throwIfObjectUndefined(data, Constants.dataIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, Constants.dataRoomIdIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.userId, Constants.dataUserIdIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.cardId, Constants.dataCardIdIsRequired);

                let room = this.getRoomOrThrowCouldNotFind(data.roomId);
                let user = room.getUser(data.userId);
                Guard.throwIfObjectUndefined(user, `Could not find user '${data.userId}' to associate with card '${data.cardId}'`);

                let card = room.deck.getCard(data.cardId);
                room.associate(user.id)(card.name);

                callback({ associated: card.users.some(id => id === user.id) });
            }

            socket.on("room-deck-card-disassociate", (data: RoomDeckCardDisassociateEventArgs, callback: RoomDeckCardDisassociateCallback) => {
                try {
                    roomDeckCardDisassociate(data, callback);
                } catch (error) {
                    callback({ disassociated: false });
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomDeckCardDisassociate = (data: RoomDeckCardDisassociateEventArgs, callback: RoomDeckCardDisassociateCallback) => {
                Guard.throwIfObjectUndefined(data, Constants.dataIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, Constants.dataRoomIdIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.userId, Constants.dataUserIdIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.cardId, Constants.dataCardIdIsRequired);

                let room = this.getRoomOrThrowCouldNotFind(data.roomId);
                let user = room.getUser(data.userId);
                Guard.throwIfObjectUndefined(user, `Could not find user '${data.userId}' to disassociate with card '${data.cardId}'`);

                let card = room.deck.getCard(data.cardId);
                room.disassociate(user.id)(card.name);
                callback({ disassociated: !card.users.some(id => id === user.id) });
            }

            socket.on("room-deck-reset", (data: RoomDeckResetEventArgs, callback?: Function) => {
                try {
                    roomDeckReset(data, callback);
                } catch (error) {
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomDeckReset = (data: RoomDeckResetEventArgs, callback?: Function) => {
                Guard.throwIfObjectUndefined(data, Constants.dataIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, Constants.dataRoomIdIsRequired);

                let room = this.getRoomOrThrowCouldNotFind(data.roomId);
                Guard.validate(room.getUser(socket.id).role.name === Roles.Guest.toString(), Constants.userDoesNotHavePermissionToResetDeck);

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

            socket.on("room-deck-lock", (data: RoomDeckLockEventArgs, callback?: Function) => {
                try {
                    roomDeckLock(data, callback);
                } catch (error) {
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomDeckLock = (data: RoomDeckLockEventArgs, callback?: Function) => {
                Guard.throwIfObjectUndefined(data, Constants.dataIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, Constants.dataRoomIdIsRequired);

                let room = this.getRoomOrThrowCouldNotFind(data.roomId);
                Guard.validate(room.getUser(socket.id).role.name === Roles.Guest.toString(), Constants.userDoesNotHavePermissionToLockDeck);

                room.deck.setLocked(true);
                this.io.in(room.id).emit("room-hand-lock");

                if (callback) {
                    callback();
                }
            }

            socket.on("room-deck-unlock", (data: RoomDeckUnlockEventArgs, callback?: Function) => {
                try {
                    roomDeckUnlock(data, callback);
                } catch (error) {
                    this.emitInternalServerError(socket, error);
                }
            });

            let roomDeckUnlock = (data: any, callback?: Function) => {
                Guard.throwIfObjectUndefined(data, Constants.dataIsRequired);
                Guard.throwIfStringNotDefinedOrEmpty(data.roomId, Constants.dataRoomIdIsRequired);

                let room = this.getRoomOrThrowCouldNotFind(data.roomId);
                Guard.validate(room.getUser(socket.id).role.name === Roles.Guest.toString(), Constants.userDoesNotHavePermissionToUnlockDeck);

                room.deck.setLocked(false);
                this.io.in(room.id).emit("room-hand-unlock");

                if (callback) {
                    callback();
                }
            }
        });
    }

    private emitRoomsAllEventWithTotalRooms() {
        this.io.emit(RoomsAllEvent.eventName, this.rooms.length);
    }

    private emitUsersAllEventWithTotalUsersInAllRooms() {
        this.io.emit(UsersAllEvent.eventName, this.rooms.length ? this.getAllUsersFromAllRooms() : 0);
    }

    private getAllUsersFromAllRooms = () => this.rooms.map(x => x.users.length).reduce((p, c, ) => p + c);

    private emitLoggedUsersToRoom(socket: ISocket, room: Room) {
        let roomShowAllEvent = new RoomShowAllEvent(room.users);
        socket.server.to(room.id).emit(RoomShowAllEvent.eventName, roomShowAllEvent.users);
    }

    private emitInternalServerError(socket: ISocket, error: Exception) {
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