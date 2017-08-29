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

        describe("room-create", () => {
            it("should emit internal-server-error event for undefined data", (done: Function) => {
                // arrange
                let expectedParameter: string = "name";

                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(`Parameter data is required`, error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, undefined, ($value: CreateRoomCallbackArgs) => {
                        assert.equal(false, $value.access);
                        assert.isUndefined($value.roomId);
                    });
                });
            });

            it("should emit internal-server-error event for empty name and access should be false", (done: Function) => {
                // arrange
                let expectedParameter: string = "name";
                let roomCreateEventArgs: { name: string } = { name: "" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);

                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(`Parameter <Object>.${expectedParameter} is required`, error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($value: CreateRoomCallbackArgs) => {
                        assert.equal(false, $value.access);
                        assert.isUndefined($value.roomId);
                    });
                });
            });

            it("should emit 'room-show-all', 'rooms-all' and 'users-all' events when creating new room", (done: Function) => {
                // arrange
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);

                client.on("connect", () => {
                    // assert
                    client.on(RoomShowAllEvent.eventName, (users: UserRole[]) => {
                        assert.equal(1, users.length);
                    });

                    // assert
                    client.on(RoomsAllEvent.eventName, (rooms: number) => {
                        assert.equal(1, rooms);
                    });

                    // assert
                    client.on(UsersAllEvent.eventName, (users: number) => {
                        assert.equal(1, users);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($value: CreateRoomCallbackArgs) => {
                        assert.equal(true, $value.access);
                        assert.isDefined($value.roomId);
                    });
                });
            });

            it("should create two rooms with one user on each room", (done: Function) => {
                // arrange
                let event: "room-create-1" | "room-create-2";
                let george: string = "George";
                let john: string = "John";
                let georgeCreateRoomEvent = new RoomCreateEvent({ name: george });
                let johnCreateRoomEvent = new RoomCreateEvent({ name: john });
                let newClient: SocketIOClient.Socket = ioClient(socketUrl, options);

                client.on("connect", () => {
                    // assert
                    client.on(RoomShowAllEvent.eventName, (users: UserRole[]) => {
                        assert.equal(1, users.length);
                    });

                    // assert
                    client.on(RoomsAllEvent.eventName, (rooms: number) => {
                        if (event === "room-create-1") {
                            assert.equal(1, rooms);
                        }
                        else if (event === "room-create-2") {
                            assert.equal(2, rooms);
                        }
                    });

                    // assert
                    client.on(UsersAllEvent.eventName, (users: number) => {
                        if (event === "room-create-1") {
                            assert.equal(1, users);
                        } else if (event === "room-create-2") {
                            assert.equal(2, users);
                            newClient.disconnect();
                            done();
                        }
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, georgeCreateRoomEvent.data, ($value: CreateRoomCallbackArgs) => {
                        event = "room-create-1";
                        assert.equal(true, $value.access);
                        assert.isDefined($value.roomId);

                        newClient.emit(RoomCreateEvent.eventName, johnCreateRoomEvent.data, ($value: CreateRoomCallbackArgs) => {
                            event = "room-create-2";
                            assert.equal(true, $value.access);
                            assert.isDefined($value.roomId);
                        });
                    });
                });
            });

            it("should emit 'internal-server-error' when same socket tries to create another rooom", (done: Function) => {
                // arrange
                let george: string = "George";
                let john: string = "John";
                let georgeCreateRoomEvent = new RoomCreateEvent({ name: george });
                let johnCreateRoomEvent = new RoomCreateEvent({ name: john });

                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "You are already in another room");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, georgeCreateRoomEvent.data, ($value: CreateRoomCallbackArgs) => {
                        assert.isTrue($value.access);
                        assert.isDefined($value.roomId);

                        client.emit(RoomCreateEvent.eventName, johnCreateRoomEvent.data, ($value: CreateRoomCallbackArgs) => {
                            assert.isFalse($value.access);
                            assert.isUndefined($value.roomId);
                        });
                    });
                });
            });
        });
    })
});