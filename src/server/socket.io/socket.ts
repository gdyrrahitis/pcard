import * as uuidV1 from "uuid/v1";
import { Room } from "../../domain/room";
import { User } from "../../domain/user";

const roomShowAllEvent: string = "room-show-all";
const roomsFullEvent: string = "rooms-full";
const roomNotFoundEvent: string = "room-not-found";
const userBannedEvent: string = "user-banned";
const userDisconnectedEvent: string = "user-disconnected";
const internalServerError: string = "internal-server-error";
const max: number = 10000;
export class Socket {
    private rooms: Room[] = [];
    private roomPrefix: string = "private-";
    constructor(private io: SocketIO.Server) { }

    public connect() {
        this.io.on("connection", (socket: ISocket) => {
            socket.on("room-create", (data, callback) => {
                try {
                    createRoom(data, callback);
                } catch (error) {
                    callback({ access: false });
                    socket.emit(internalServerError, error);
                }
            });

            let createRoom = (data, callback) => {
                if (this.rooms.length >= max) {
                    callback({ access: false });
                    socket.emit(roomsFullEvent);
                    return;
                }

                let user: User = { id: socket.id, name: data.name };
                let roomId = uuidV1();
                let room = new Room(roomId);
                room.addUser(user);

                socket.join(room.id);
                socket.room = room.id;
                socket.server.to(room.id).emit(roomShowAllEvent, room.users);

                this.rooms.push(room);
                callback({ access: true, roomId: roomId });
            }

            socket.on("room-disconnect", (data, callback) => {
                try {
                    disconnect(data, callback);
                } catch (error) {
                    socket.emit(internalServerError, error);
                }
            });

            let disconnect = (data, callback) => {
                let room: Room = this.rooms.filter(r => r.id == data.roomId)[0];

                if (room) {
                    room.removeUser(data.userId);
                    socket.server.to(room.id).emit(roomShowAllEvent, room.users);
                    socket.emit(userDisconnectedEvent, room.id);
                    callback();
                }
            }

            socket.on("room-join", (data, callback) => {
                try {
                    roomJoin(data, callback);
                } catch (error) {
                    callback({ access: false });
                    socket.emit(internalServerError, error);
                }
            });

            let roomJoin = (data, callback) => {
                var room = this.rooms.filter(r => r.id == data.roomId)[0];

                if (!room) {
                    callback({ access: false });
                    socket.emit(roomNotFoundEvent);
                    return;
                }

                let user: User = { id: socket.id, name: data.name };
                room.addUser(user);

                socket.room = room.id;
                socket.join(room.id);

                callback({ access: true });
                socket.server.to(room.id).emit(roomShowAllEvent, room.users);
            }

            socket.on("room-leave", (data) => {
                try {
                    roomLeave(data);
                } catch (error) {
                    socket.emit(internalServerError, error);
                }
            });

            let roomLeave = (data) => {
                let room: Room = this.rooms.filter(r => r.id == data.roomId)[0];
                if (room) {
                    room.removeUser(data.userId);
                    socket.server.to(room.id).emit(roomShowAllEvent, room.users);
                }
            }

            socket.on("ban", (data) => {
                try {
                    ban(data);
                } catch (error) {
                    socket.emit(internalServerError, error);
                }
            });

            let ban = (data) => {
                let room = this.rooms.filter(r => r.id == data.roomId)[0];
                if (room) {
                    room.removeUser(data.userId);
                    this.io.to(data.userId).emit(userBannedEvent);
                    socket.server.to(room.id).emit(roomShowAllEvent, room.users);
                }
            }

            socket.on("room-get-all", (data) => {
                try {
                    roomGetAll(data);
                } catch (error) {
                    socket.emit(internalServerError, error);
                }
            });

            let roomGetAll = (data) => {
                let room = this.rooms.filter(r => r.id == data.roomId)[0];
                if (room) {
                    socket.server.to(room.id).emit(roomShowAllEvent, room.users);
                }
            }
        });
    }
}