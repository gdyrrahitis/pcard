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

        describe("room-join", () => {
            it("should emit 'room-not-found' event when room does not exist", (done: Function) => {
                // arrange
                let roomJoinEventArgs: { roomId: string, name: string } = { roomId: "non-existent-room", name: "non-existent-name" };
                let roomJoinEvent: RoomJoinEvent = new RoomJoinEvent(roomJoinEventArgs);
                let isCallbackCalled: boolean = false;
                client.on("connect", () => {
                    // assert
                    client.on(RoomNotFoundEvent.eventName, () => {
                        assert.isTrue(isCallbackCalled);
                        done();
                    });

                    // act
                    client.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($value: RoomJoinCallbackArgs) => {
                        assert.isFalse($value.access);
                        isCallbackCalled = true;
                    });
                });
            });

            it("should emit 'internal-server-error' when same socket tries to join room", (done: Function) => {
                client.on("connect", () => {
                    // assert
                    let rooms = server.sockets.adapter.rooms;
                    let roomJoinEventArgs: { roomId: string, name: string };
                    let roomJoinEvent: RoomJoinEvent;
                    let roomCreateEventArgs: { name: string } = { name: "George" };
                    let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);

                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal("Cannot add user with same id", error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        roomJoinEventArgs = { roomId: $create.roomId, name: "George" };
                        roomJoinEvent = new RoomJoinEvent(roomJoinEventArgs);

                        client.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($value: RoomJoinCallbackArgs) => {
                            assert.isFalse($value.access);
                        });
                    });
                });
            });

            it("should emit 'internal-server-error' when data is not defined for room-join event", (done: Function) => {
                client.on("connect", () => {
                    // assert
                    let rooms = server.sockets.adapter.rooms;
                    let roomJoinEventArgs: { roomId: string, name: string };
                    let roomJoinEvent: RoomJoinEvent;
                    let roomCreateEventArgs: { name: string } = { name: "George" };
                    let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);

                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal("Parameter data is required", error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        client.emit(RoomJoinEvent.eventName, undefined, ($value: RoomJoinCallbackArgs) => {
                            assert.isFalse($value.access);
                        });
                    });
                });
            });

            it("should emit 'internal-server-error' when data is null for room-join event", (done: Function) => {
                client.on("connect", () => {
                    // assert
                    let rooms = server.sockets.adapter.rooms;
                    let roomJoinEventArgs: { roomId: string, name: string };
                    let roomJoinEvent: RoomJoinEvent;
                    let roomCreateEventArgs: { name: string } = { name: "George" };
                    let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);

                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal("Parameter data is required", error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        client.emit(RoomJoinEvent.eventName, null, ($value: RoomJoinCallbackArgs) => {
                            assert.isFalse($value.access);
                        });
                    });
                });
            });

            it("should emit 'internal-server-error' when room is undefined or empty", (done: Function) => {
                client.on("connect", () => {
                    // assert
                    let rooms = server.sockets.adapter.rooms;
                    let roomJoinEventArgs: { roomId: string, name: string };
                    let roomJoinEvent: RoomJoinEvent;
                    let roomCreateEventArgs: { name: string } = { name: "George" };
                    let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);

                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal("Parameter <Object>.roomId is required", error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        roomJoinEventArgs = { roomId: undefined, name: "John" };
                        roomJoinEvent = new RoomJoinEvent(roomJoinEventArgs);

                        client.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($value: RoomJoinCallbackArgs) => {
                            assert.isFalse($value.access);
                        });
                    });
                });
            });

            it("should emit 'internal-server-error' when name is not defined", (done: Function) => {
                client.on("connect", () => {
                    // assert
                    let rooms = server.sockets.adapter.rooms;
                    let roomJoinEventArgs: { roomId: string, name: string };
                    let roomJoinEvent: RoomJoinEvent;
                    let roomCreateEventArgs: { name: string } = { name: "George" };
                    let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);

                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal("Parameter <Object>.name is required", error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        roomJoinEventArgs = { roomId: $create.roomId, name: undefined };
                        roomJoinEvent = new RoomJoinEvent(roomJoinEventArgs);

                        client.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($value: RoomJoinCallbackArgs) => {
                            assert.isFalse($value.access);
                        });
                    });
                });
            });

            it("should add user to valid room, allow access and emits 'users-all' event to update global list of users", (done: Function) => {
                client.on("connect", () => {
                    // assert
                    let rooms = server.sockets.adapter.rooms;
                    let roomJoinEventArgs: { roomId: string, name: string };
                    let roomJoinEvent: RoomJoinEvent;
                    let john: string = "John";
                    let george: string = "George";
                    let roomCreateEventArgs: { name: string } = { name: george };
                    let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                    let status: "room-create" | "room-join";

                    // asserts room-show-all for moderator
                    client.on(RoomShowAllEvent.eventName, (users: UserRole[]) => {
                        if (status === "room-create") {
                            // happens when current socket creates room
                            assert.equal(1, users.length);
                            assert.equal(users[0].name, george);
                            assert.equal(users[0].role.name, "moderator");
                        }
                        else if (status === "room-join") {
                            // happens when someone else joins
                            assert.equal(2, users.length);
                            let userGeorge: UserRole = users.find(u => u.name === george);
                            assert.equal(userGeorge.name, george);
                            assert.equal(userGeorge.role.name, "moderator");
                            let userJohn: UserRole = users.find(u => u.name === john);
                            assert.equal(userJohn.name, john);
                            assert.equal(userJohn.role.name, "guest");
                        }
                    });

                    client.on(UsersAllEvent.eventName, (users: number) => {
                        if (status === "room-create") {
                            // happens when current socket creates room
                            assert.equal(1, users);
                        }
                        else if (status === "room-join") {
                            // happens when someone else joins
                            assert.equal(2, users);
                        }
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        status = "room-create";
                        roomJoinEventArgs = { roomId: $create.roomId, name: john };
                        roomJoinEvent = new RoomJoinEvent(roomJoinEventArgs);

                        // someone else is connected and joins room
                        let newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            status = "room-join";
                            newClient.on(RoomShowAllEvent.eventName, (users: UserRole[]) => {
                                // when he joins, room will have two users, including him
                                assert.equal(2, users.length);
                                let userGeorge: UserRole = users.find(u => u.name === george);
                                assert.equal(userGeorge.name, george);
                                assert.equal(userGeorge.role.name, "moderator");
                                let userJohn: UserRole = users.find(u => u.name === john);
                                assert.equal(userJohn.name, john);
                                assert.equal(userJohn.role.name, "guest");
                            });

                            newClient.on(UsersAllEvent.eventName, (users: number) => {
                                assert.equal(2, users);
                                newClient.disconnect();
                                done();
                            });

                            newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($value: RoomJoinCallbackArgs) => {
                                assert.isTrue($value.access);
                            });
                        });
                    });
                });
            });
        });
    })
});