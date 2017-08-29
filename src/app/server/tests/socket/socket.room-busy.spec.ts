import * as ioClient from "socket.io-client";
import * as io from "socket.io";

import { Socket } from "../../socket.io/socket";
import { UserRole } from "../../../domain/index";
import {
    RoomCreateEvent, RoomGetAllEvent, InternalServerErrorEvent, RoomShowAllEvent,
    RoomsAllEvent, UsersAllEvent, RoomNotFoundEvent, RoomJoinEvent, RequestAllRoomsEvent,
    RequestAllUsersEvent, RoomDisconnectEvent, UserDisconnectedEvent, BanEvent, UserBannedEvent
} from "../../../domain/events/index";
import { options, socketUrl, assert } from "../socket.spec.common";

describe("Server", () => {
    describe("Socket", () => {
        let server: SocketIO.Server;
        let socket: Socket;
        let client: SocketIOClient.Socket;

        beforeEach(() => {
            server = io().listen(5000);
            socket = new Socket(server);
            socket.connect();
            client = ioClient.connect(socketUrl, options);
        });

        afterEach(() => {
            server.close();
            client.close();
        });

        describe("room-busy", () => {
            it("should emit 'internal-server-error' when data is undefined", (done: Function) => {
                client.on("connect", () => {
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter data is required");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    client.emit("room-busy", undefined);
                });
            });

            it("should emit 'internal-server-error' when roomId is not defined or empty", (done: Function) => {
                client.on("connect", () => {
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter <Object>.roomId is required");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    client.emit("room-busy", { roomId: "" });
                });
            });

            it("should emit 'internal-server-error' room is not found", (done: Function) => {
                // arrange
                let room: string = "1234";
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, `Could not find room '${room}'`);
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit("room-busy", { roomId: room });
                });
            });

            it("should emit 'internal-server-error' when lock is attempted by non-moderator user", (done: Function) => {
                // arrange
                let room: string;
                let newClient: SocketIOClient.Socket;
                let roomCreateEvent = new RoomCreateEvent({ name: "George" });
                client.on("connect", () => {
                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        room = $create.roomId;

                        newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            // assert
                            newClient.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                                assert.isDefined(error.id);
                                assert.equal(error.message, `You do not have permission to lock room ${room}`);
                                assert.equal(error.name, "Error");
                                newClient.disconnect();
                                done();
                            });

                            let roomJoinEvent = new RoomJoinEvent({ name: "John", roomId: room });
                            newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($join: RoomJoinCallbackArgs) => {
                                assert.isTrue($join.access);
                                newClient.emit("room-busy", { roomId: room });
                            });
                        });
                    });
                });
            });

            it("should lock room preventing new users to join", (done: Function) => {
                // arrange
                let newClient: SocketIOClient.Socket;
                let roomCreateEvent = new RoomCreateEvent({ name: "George" });
                client.on("connect", () => {
                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);

                        newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            // assert
                            newClient.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                                assert.isDefined(error.id);
                                assert.equal(error.message, "Room is locked. Users are not permitted to enter while in planning session.");
                                assert.equal(error.name, "Error");
                                newClient.disconnect();
                                done();
                            });

                            client.emit("room-busy", { roomId: $create.roomId }, () => {
                                let roomJoinEvent = new RoomJoinEvent({ name: "John", roomId: $create.roomId });
                                newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($join: RoomJoinCallbackArgs) => {
                                    assert.isFalse($join.access);
                                });
                            });
                        });
                    });
                });
            });
        });
    })
});