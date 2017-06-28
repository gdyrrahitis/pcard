import * as ioClient from "socket.io-client";
import * as io from "socket.io";
import * as chai from "chai";

import { Socket } from "../socket.io/socket";
import { UserRole } from "../../domain/index";
import {
    RoomCreateEvent, RoomGetAllEvent, InternalServerErrorEvent, RoomShowAllEvent,
    RoomsAllEvent, UsersAllEvent, RoomNotFoundEvent, RoomJoinEvent, RequestAllRoomsEvent,
    RequestAllUsersEvent, RoomDisconnectEvent, UserDisconnectedEvent, BanEvent, UserBannedEvent
} from "../../domain/events/index";

const assert = chai.assert;
const socketUrl: string = "http://localhost:5000";
const options: SocketIOClient.ConnectOpts = {
    transports: ['websocket'],
    'force new connection': true
};

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

        describe("connect", () => {
            it("should connect socket", (done: Function) => {
                client.on("connect", () => {
                    assert.equal(client.connected, true);
                    client.disconnect();
                    done();
                });
            });
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

        describe("room-disconnect", () => {
            it("should emit 'internal-server-error' for null data", (done: Function) => {
                // arrrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter data is required");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit(RoomDisconnectEvent.eventName, null, () => { });
                });
            });

            it("should emit 'internal-server-error' for empty or not defined roomId", (done: Function) => {
                // arrange
                let roomDisconnectEvent = new RoomDisconnectEvent({ roomId: undefined, userId: "1234" });
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter <Object>.roomId is required");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit(RoomDisconnectEvent.eventName, roomDisconnectEvent.data, () => { });
                });
            });

            it("should emit 'internal-server-error' for empty or not defined userId", (done: Function) => {
                // arrange
                let roomDisconnectEvent = new RoomDisconnectEvent({ roomId: "1234", userId: undefined });
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter <Object>.userId is required");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit(RoomDisconnectEvent.eventName, roomDisconnectEvent.data, () => { });
                });
            });

            it("should emit 'internal-server-error' when room is not found", (done: Function) => {
                // arrange
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                let roomId: string = "1234";
                let roomDisconnectEvent = new RoomDisconnectEvent({ roomId: roomId, userId: "user1" });
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, `Could not find room '${roomId}'`);
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($value: CreateRoomCallbackArgs) => {
                        assert.isTrue($value.access);
                        client.emit(RoomDisconnectEvent.eventName, roomDisconnectEvent.data, () => { });
                    });
                });
            });

            it("should remove guest user from room", (done: Function) => {
                // arrange
                let rooms = server.sockets.adapter.rooms;
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                client.on("connect", () => {
                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        let roomId = $create.roomId;
                        let roomJoinEvent = new RoomJoinEvent({ name: "John", roomId: roomId });

                        let newClient = ioClient.connect(socketUrl, options);
                        let status: "room-join" | "room-disconnect" = "room-join";
                        newClient.on("connect", () => {
                            newClient.on(RoomShowAllEvent.eventName, (users: UserRole[]) => {
                                if (status === "room-join") {
                                    assert.equal(users.length, 2);
                                    let john = users.find(u => u.id === newClient.id);
                                    assert.equal(john.name, "John");
                                    assert.equal(john.role.name, "guest");
                                }
                                else if (status === "room-disconnect") {
                                    assert.equal(users.length, 1);
                                    assert.equal(users[0].name, "George");
                                    assert.equal(users[0].role.name, "moderator");
                                }
                            });

                            newClient.on(RoomsAllEvent.eventName, (rooms: number) => {
                                assert.equal(rooms, 1);
                            });

                            newClient.on(UsersAllEvent.eventName, (users: number) => {
                                if (status === "room-join") {
                                    assert.equal(users, 2);
                                }
                                else if (status === "room-disconnect") {
                                    assert.equal(users, 1);
                                    newClient.disconnect();
                                    done();
                                }
                            });


                            newClient.on(UserDisconnectedEvent.eventName, (data: string) => {
                                status = "room-disconnect";
                                assert.equal(data, roomId);
                            });

                            newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($disconnect: RoomJoinCallbackArgs) => {
                                assert.isTrue($disconnect.access);
                                let roomDisconnectedEvent = new RoomDisconnectEvent({ roomId: roomId, userId: newClient.id });
                                newClient.emit(RoomDisconnectEvent.eventName, roomDisconnectedEvent.data, () => { })
                            });
                        });
                    });
                });
            });

            it("should remove last user and room from list of rooms", (done: Function) => {
                // arrange
                let room: string;
                let rooms = server.sockets.adapter.rooms;
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                let status: "room-create" | "room-disconnect" = "room-create";
                client.on("connect", () => {
                    // assert
                    client.on(UserDisconnectedEvent.eventName, (roomId: string) => {
                        status = "room-disconnect";
                        assert.equal(roomId, room);
                    });

                    client.on(RoomShowAllEvent.eventName, (users: UserRole[]) => {
                        if (status === "room-create") {
                            assert.equal(1, users.length);
                            assert.equal(users[0].id, client.id);
                            assert.equal(users[0].name, "George");
                            assert.equal(users[0].role.name, "moderator");
                        } else if (status === "room-disconnect") {
                            assert.equal(0, users.length);
                        }
                    });

                    client.on(RoomsAllEvent.eventName, (rooms: number) => {
                        if (status === "room-create") {
                            assert.equal(1, rooms);
                        } else if (status === "room-disconnect") {
                            assert.equal(0, rooms);
                        }
                    });

                    client.on(UsersAllEvent.eventName, (users: number) => {
                        if (status === "room-create") {
                            assert.equal(1, users);
                        } else if (status === "room-disconnect") {
                            assert.equal(0, users);
                            done();
                        }
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        room = $create.roomId;
                        let roomDisconnectEvent = new RoomDisconnectEvent({ roomId: room, userId: client.id });
                        client.emit(RoomDisconnectEvent.eventName, roomDisconnectEvent.data, () => { });
                    });
                });
            });

            it("should remove all users and the room from list of rooms when moderator disconnects", (done: Function) => {
                // arrange
                let newClient: SocketIOClient.Socket;
                let room: string;
                let status: "room-create" | "room-join" | "room-disconnect" = "room-create";
                let rooms = server.sockets.adapter.rooms;
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                client.on("connect", () => {
                    // act
                    client.on(UserDisconnectedEvent.eventName, (roomId: string) => {
                        status = "room-disconnect";
                        assert.equal(roomId, room);
                    });

                    client.on(RoomsAllEvent.eventName, (rooms: number) => {
                        if (status === "room-create") {
                            assert.equal(1, rooms);
                        } else if (status === "room-join") {
                            assert.equal(1, rooms);
                        } else if (status === "room-disconnect") {
                            assert.equal(0, rooms);
                        }
                    });

                    client.on(UsersAllEvent.eventName, (users: number) => {
                        if (status === "room-create") {
                            assert.equal(1, users);
                        } else if (status === "room-join") {
                            assert.equal(2, users);
                        } else if (status === "room-disconnect") {
                            assert.equal(0, users);
                            newClient.disconnect();
                            done();
                        }
                    });


                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        room = $create.roomId;
                        let roomJoinEvent = new RoomJoinEvent({ name: "John", roomId: room });

                        newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            status = "room-join";
                            newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($disconnect: RoomJoinCallbackArgs) => {
                                assert.isTrue($disconnect.access);
                                // disconnecting moderator
                                let roomDisconnectedEvent = new RoomDisconnectEvent({ roomId: room, userId: client.id });
                                client.emit(RoomDisconnectEvent.eventName, roomDisconnectedEvent.data, () => { })
                            });
                        });
                    });
                });
            });
        });

        describe("ban", () => {
            it("should emit 'internal-server-error' for undefined data", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter data is required");
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(BanEvent.eventName, undefined);
                });
            });

            it("should emit 'internal-server-error' for undefined or empty roomId", (done: Function) => {
                // arrange
                let banEvent = new BanEvent({ roomId: "", userId: "user1" })
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter <Object>.roomId is required");
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(BanEvent.eventName, banEvent.data);
                });
            });

            it("should emit 'internal-server-error' for undefined or empty userId", (done: Function) => {
                // arrange
                let banEvent = new BanEvent({ roomId: "1234", userId: "" })
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter <Object>.userId is required");
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(BanEvent.eventName, banEvent.data);
                });
            });

            it("should emit 'internal-server-error' for non existent room", (done: Function) => {
                // arrange
                let roomId: string = "1234";
                let banEvent = new BanEvent({ roomId: "1234", userId: "user1" })
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, `Could not find room '${roomId}'`);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(BanEvent.eventName, banEvent.data);
                });
            });

            it("should not be able to ban self, emitting internal-server-error", (done: Function) => {
                // arrange
                let roomId: string = "1234";
                let roomCreateEvent = new RoomCreateEvent({ name: "George" });
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, `You cannot ban yourself`);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($value: CreateRoomCallbackArgs) => {
                        assert.isTrue($value.access);
                        let banEvent = new BanEvent({ roomId: $value.roomId, userId: client.id });
                        client.emit(BanEvent.eventName, banEvent.data);
                    });
                });
            });

            it("should ban guest user", (done: Function) => {
                // arrange
                let newClient: SocketIOClient.Socket;
                let status: "room-create" | "room-join" | "ban" = "room-create";
                let roomCreateEvent = new RoomCreateEvent({ name: "George" });
                client.on("connect", () => {
                    // assert
                    client.on(RoomShowAllEvent.eventName, (users: UserRole[]) => {
                        if (status === "room-create") {
                            assert.equal(users.length, 1);
                            assert.equal(users[0].id, client.id);
                            assert.equal(users[0].name, "George");
                            assert.equal(users[0].role.name, "moderator");
                        } else if (status === "room-join") {
                            assert.equal(users.length, 2);
                            let george = users.find(u => u.name === "George");
                            assert.equal(george.id, client.id);
                            assert.equal(george.name, "George");
                            assert.equal(george.role.name, "moderator");
                            let john = users.find(u => u.name === "John");
                            assert.equal(john.id, newClient.id);
                            assert.equal(john.name, "John");
                            assert.equal(john.role.name, "guest");
                        } else if (status === "ban") {
                            assert.equal(users.length, 1);
                            assert.equal(users[0].id, client.id);
                            assert.equal(users[0].name, "George");
                            assert.equal(users[0].role.name, "moderator");
                        }
                    });

                    client.on(UsersAllEvent.eventName, (users: number) => {
                        if (status === "room-create") {
                            assert.equal(users, 1);
                        } else if (status === "room-join") {
                            assert.equal(users, 2);
                        } else if (status === "ban") {
                            assert.equal(users, 1);
                            newClient.disconnect();
                            done();
                        }
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);

                        let roomJoinEvent = new RoomJoinEvent({ name: "John", roomId: $create.roomId });
                        newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            status = "room-join";
                            newClient.on(UserBannedEvent.eventName, () => {
                                status = "ban";
                            });

                            newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($join: RoomJoinCallbackArgs) => {
                                assert.isTrue($join.access);
                                let banEvent = new BanEvent({ roomId: $create.roomId, userId: newClient.id });
                                client.emit(BanEvent.eventName, banEvent.data);
                            });
                        });
                    });
                });
            });
        });

        describe("room-get-all", () => {
            it("should emit internal server error no rooms have been created", (done: Function) => {
                // arrange
                let roomId: string = "invalid";
                let roomGetAllEventArgs: { roomId: string } = { roomId: roomId };
                let roomGetAllEvent = new RoomGetAllEvent(roomGetAllEventArgs);

                client.on("connect", () => {
                    // assert
                    client.once(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(`Could not find room '${roomId}'`, error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomGetAllEvent.eventName, roomGetAllEvent.data);
                });
            });

            it("should emit internal server error when no data is passed", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.once(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal("Parameter data is required", error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomGetAllEvent.eventName);
                });
            });

            it("should emit internal server error when room is not found", (done: Function) => {
                // arrange
                let roomId: string = "fake";
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                let roomGetAllEventArgs: { roomId: string } = { roomId: roomId };
                let roomGetAllEvent = new RoomGetAllEvent(roomGetAllEventArgs);

                client.on("connect", () => {
                    // assert
                    client.once(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(`Could not find room '${roomId}'`, error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => { });
                    client.emit(RoomGetAllEvent.eventName, roomGetAllEvent.data);
                });
            });

            it("should emit 1 when one user is in room", (done: Function) => {
                // arrange
                let roomId: string;
                let roomGetAllEventArgs: { roomId: string };
                let roomGetAllEvent: RoomGetAllEvent;
                let role: string = "moderator";
                let name: string = "George";
                let roomCreateEventArgs: { name: string } = { name: name };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                let rooms = server.sockets.adapter.rooms;

                client.on("connect", () => {
                    // assert
                    client.once(RoomShowAllEvent.eventName, (users: UserRole[]) => {
                        assert.equal(1, users.length);
                        assert.equal(name, users[0].name);
                        assert.equal(role, users[0].role.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        roomGetAllEventArgs = { roomId: roomId };
                        roomGetAllEvent = new RoomGetAllEvent(roomGetAllEventArgs);

                        client.emit(RoomGetAllEvent.eventName, roomGetAllEvent.data);
                    });
                });
            });
        });

        describe("request-all-rooms", () => {
            it("should return 0 when no room is created", (done: Function) => {
                client.on("connect", () => {
                    client.on(RoomsAllEvent.eventName, (rooms: number) => {
                        assert.equal(0, rooms);
                        done();
                    });

                    client.emit(RequestAllRoomsEvent.eventName);
                });
            });

            it("should return 1 when one room is created", (done: Function) => {
                // arrange
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                let status: "before:room-created" | "after:room-created" = "before:room-created";

                client.on("connect", () => {
                    // assert
                    client.on(RoomsAllEvent.eventName, (rooms: number) => {
                        assert.equal(1, rooms);

                        if (status === "after:room-created") {
                            done();
                        }

                        status = "after:room-created";
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => { });
                    client.emit(RequestAllRoomsEvent.eventName);
                });
            });

            it("should return 2 when two rooms are created", (done: Function) => {
                // arrange
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                let status: "before:new-room-created" | "after:new-room-created" = "before:new-room-created";
                let newClient: SocketIOClient.Socket;

                client.on("connect", () => {
                    // assert
                    client.on(RoomsAllEvent.eventName, (rooms: number) => {
                        if (status === "before:new-room-created") {
                            assert.equal(1, rooms);
                        } else if (status === "after:new-room-created") {
                            assert.equal(2, rooms);
                            newClient.disconnect();
                            done();
                        }
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            status = "after:new-room-created";
                            newClient.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => { });
                        });
                    });
                    client.emit(RequestAllRoomsEvent.eventName);
                });
            });
        });

        describe("users-all", () => {
            it("should return 0 users when no room is created", (done: Function) => {
                client.on("connect", () => {
                    client.on(UsersAllEvent.eventName, (users: number) => {
                        assert.equal(0, users);
                        done();
                    });

                    client.emit(RequestAllUsersEvent.eventName);
                });
            });

            it("should return total 1 user when one room is created", (done: Function) => {
                // arrange
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                let status: "before:room-created" | "after:room-created" = "before:room-created";

                client.on("connect", () => {
                    // assert
                    client.on(UsersAllEvent.eventName, (users: number) => {
                        assert.equal(1, users);

                        if (status === "after:room-created") {
                            done();
                        }

                        status = "after:room-created";
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        client.emit(RequestAllUsersEvent.eventName);
                    });
                });
            });

            it("should return total 2 users when two rooms are created", (done: Function) => {
                // arrange
                let newClient: SocketIOClient.Socket;
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                let status: "before:new-room-created" | "after:new-room-created" = "before:new-room-created";

                client.on("connect", () => {
                    // assert
                    client.on(UsersAllEvent.eventName, (users: number) => {
                        if (status === "before:new-room-created") {
                            assert.equal(1, users);
                        } else if (status === "after:new-room-created") {
                            assert.equal(2, users);
                            newClient.disconnect();
                            done();
                        }
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            status = "after:new-room-created";
                            newClient.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                                client.emit(RequestAllUsersEvent.eventName);
                            });
                        });
                    });
                });
            });

            it("should return total 2 users when one room is created and user has joined", (done: Function) => {
                // arrange
                let newClient: SocketIOClient.Socket;
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                let rooms = server.sockets.adapter.rooms;
                let status: "room-create" | "room-join" = "room-create";

                client.on("connect", () => {
                    // assert
                    client.on(UsersAllEvent.eventName, (users: number) => {
                        if (status === "room-create") {
                            assert.equal(1, users);
                        } else if (status === "room-join") {
                            assert.equal(2, users);
                            newClient.disconnect();
                            done();
                        }
                    });

                    client.on(RoomsAllEvent.eventName, (rooms: number) => {
                        assert.equal(1, rooms);
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        let roomJoinEvent = new RoomJoinEvent({ name: "John", roomId: $create.roomId });

                        newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            status = "room-join";
                            newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($join: RoomJoinCallbackArgs) => {
                                assert.isTrue($join.access);
                                client.emit(RequestAllUsersEvent.eventName);
                            });
                        });
                    });
                });
            });
        });

        describe("rooms-all", () => {
            it("should return 0 rooms when no room is created", (done: Function) => {
                client.on("connect", () => {
                    client.on(RoomsAllEvent.eventName, (users: number) => {
                        assert.equal(0, users);
                        done();
                    });

                    client.emit(RequestAllRoomsEvent.eventName);
                });
            });

            it("should return total 1 room when one room is created", (done: Function) => {
                // arrange
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                let status: "before:room-created" | "after:room-created" = "before:room-created";

                client.on("connect", () => {
                    // assert
                    client.on(RoomsAllEvent.eventName, (rooms: number) => {
                        assert.equal(1, rooms);

                        if (status === "after:room-created") {
                            done();
                        }

                        status = "after:room-created";
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        client.emit(RequestAllRoomsEvent.eventName);
                    });
                });
            });

            it("should return total 2 rooms when two rooms are created", (done: Function) => {
                // arrange
                let newClient: SocketIOClient.Socket;
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                let status: "before:new-room-created" | "after:new-room-created" = "before:new-room-created";

                client.on("connect", () => {
                    // assert
                    client.on(RoomsAllEvent.eventName, (rooms: number) => {
                        if (status === "before:new-room-created") {
                            assert.equal(1, rooms);
                        } else if (status === "after:new-room-created") {
                            assert.equal(2, rooms);
                            newClient.disconnect();
                            done();
                        }
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            newClient.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($data: CreateRoomCallbackArgs) => {
                                assert.isTrue($data.access);
                                status = "after:new-room-created";
                                client.emit(RequestAllRoomsEvent.eventName);
                            });
                        });
                    });
                });
            });

            it("should return total 1 rooms when one room is created and another user has joined", (done: Function) => {
                // arrange
                let newClient: SocketIOClient.Socket;
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                let rooms = server.sockets.adapter.rooms;
                let status: "room-create" | "room-join" = "room-create";

                client.on("connect", () => {
                    // assert
                    client.on(RoomsAllEvent.eventName, (rooms: number) => {
                        if (status === "room-create") {
                            assert.equal(1, rooms);
                        } else if (status === "room-join") {
                            assert.equal(1, rooms);
                            newClient.disconnect();
                            done();
                        }
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access, "Not allowed to create room");
                        let roomJoinEvent = new RoomJoinEvent({ name: "John", roomId: $create.roomId });

                        newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            status = "room-join";
                            newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($join: RoomJoinCallbackArgs) => {
                                assert.isTrue($join.access, "Not allowed to join room");
                                client.emit(RequestAllRoomsEvent.eventName);
                            });
                        });
                    });
                });
            });
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

        describe("room-free", () => {
            it("should emit 'internal-server-error' when data is undefined", (done: Function) => {
                client.on("connect", () => {
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter data is required");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    client.emit("room-free", undefined);
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

                    client.emit("room-free", { roomId: "" });
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
                    client.emit("room-free", { roomId: room });
                });
            });

            it("should emit 'internal-server-error' unlock is attempted by non-moderator user", (done: Function) => {
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
                                newClient.emit("room-free", { roomId: room });
                            });
                        });
                    });
                });
            });

            it("should unlock room allowing new users to join", (done: Function) => {
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
                            newClient.on(RoomShowAllEvent.eventName, (users: UserRole[]) => {
                                // when he joins, room will have two users, including him
                                assert.equal(2, users.length);
                                let userGeorge: UserRole = users.find(u => u.name === "George");
                                assert.equal(userGeorge.name, "George");
                                assert.equal(userGeorge.role.name, "moderator");
                                let userJohn: UserRole = users.find(u => u.name === "John");
                                assert.equal(userJohn.name, "John");
                                assert.equal(userJohn.role.name, "guest");
                            });

                            newClient.on(UsersAllEvent.eventName, (users: number) => {
                                assert.equal(2, users);
                                newClient.disconnect();
                                done();
                            });

                            client.emit("room-busy", { roomId: $create.roomId }, () => {
                                client.emit("room-free", { roomId: $create.roomId }, () => {
                                    let roomJoinEvent = new RoomJoinEvent({ name: "John", roomId: $create.roomId });
                                    newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($join: RoomJoinCallbackArgs) => {
                                        assert.isTrue($join.access);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        describe("room-deck-lock", () => {
            it("should emit 'internal-server-error' for undefined data", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter data is required");
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit("room-deck-lock", undefined);
                });
            });

            it("should emit 'internal-server-error' for roomId not defined", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter <Object>.roomId is required");
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit("room-deck-lock", { roomId: "" });
                });
            });

            it("should emit 'internal-server-error' for not found room", (done: Function) => {
                // arrange
                let roomId: string = "1234";
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, `Could not find room '${roomId}'`);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit("room-deck-lock", { roomId: roomId });
                });
            });

            it("should emit 'room-hand-lock' when deck is locked", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on("room-hand-lock", () => {
                        assert.isTrue(true);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, { name: "George" }, ($create: CreateRoomCallbackArgs) => {
                        client.emit("room-deck-lock", { roomId: $create.roomId });
                    });
                });
            });

            it("should emit 'room-hand-lock' when deck is locked and prevent further associations with cards", (done: Function) => {
                // arrange
                let roomId: string;
                client.on("connect", () => {
                    // assert
                    client.on("room-hand-lock", () => {
                        assert.isTrue(true);

                        client.emit("room-deck-card-associate",
                            { roomId: roomId, userId: client.id, cardId: "zero" },
                            ($data: RoomDeckCardAssociateCallbackArgs) => {
                                assert.isFalse($data.associated);
                                done();
                            });
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, { name: "George" }, ($create: CreateRoomCallbackArgs) => {
                        roomId = $create.roomId;
                        client.emit("room-deck-lock", { roomId: $create.roomId });
                    });
                });
            });

            it("should emit 'room-hand-lock' when deck is locked and prevent further disassociations with cards", (done: Function) => {
                // arrange
                let roomId: string;
                client.on("connect", () => {
                    // assert
                    client.on("room-hand-lock", () => {
                        assert.isTrue(true);

                        client.emit("room-deck-card-disassociate",
                            { roomId: roomId, userId: client.id, cardId: "zero" },
                            ($data: RoomDeckCardDisassociateCallbackArgs) => {
                                assert.isFalse($data.disassociated);
                                done();
                            });
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, { name: "George" }, ($create: CreateRoomCallbackArgs) => {
                        roomId = $create.roomId;
                        client.emit("room-deck-card-associate",
                            { roomId: roomId, userId: client.id, cardId: "zero" },
                            ($data: RoomDeckCardAssociateCallbackArgs) => {
                                assert.isTrue($data.associated);
                                client.emit("room-deck-lock", { roomId: $create.roomId });
                            });
                    });
                });
            });

            it("should emit the 'internal-server-error' if other than moderator attempts to lock deck", (done: Function) => {
                // arrange
                let newClient: SocketIOClient.Socket;
                let roomCreateEvent = new RoomCreateEvent({ name: "George" });
                client.on("connect", () => {
                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            // assert
                            newClient.on("internal-server-error", (error: Exception) => {
                                assert.isDefined(error.id);
                                assert.equal(error.message, "User does not have permission to lock deck");
                                assert.equal("Error", error.name);
                                newClient.disconnect();
                                done();
                            });

                            let roomJoinEvent = new RoomJoinEvent({ name: "John", roomId: $create.roomId });
                            newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($join: RoomJoinCallbackArgs) => {
                                client.emit("room-deck-card-associate",
                                    { roomId: $create.roomId, userId: client.id, cardId: "zero" },
                                    ($clientData: RoomDeckCardAssociateCallbackArgs) => {
                                        newClient.emit("room-deck-card-associate",
                                            { roomId: $create.roomId, userId: newClient.id, cardId: "zero" },
                                            ($newClientData: RoomDeckCardAssociateCallbackArgs) => {
                                                newClient.emit("room-deck-lock", { roomId: $create.roomId });
                                            });
                                    });
                            });
                        });
                    });
                });
            });
        });

        describe("room-deck-unlock", () => {
            it("should emit 'internal-server-error' for undefined data", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter data is required");
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit("room-deck-unlock", undefined);
                });
            });

            it("should emit 'internal-server-error' for roomId not defined", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter <Object>.roomId is required");
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit("room-deck-unlock", { roomId: "" });
                });
            });

            it("should emit 'internal-server-error' for not found room", (done: Function) => {
                // arrange
                let roomId: string = "1234";
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, `Could not find room '${roomId}'`);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit("room-deck-unlock", { roomId: roomId });
                });
            });

            it("should emit 'room-hand-unlock' when deck is unlocked", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on("room-hand-unlock", () => {
                        assert.isTrue(true);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, { name: "George" }, ($create: CreateRoomCallbackArgs) => {
                        client.emit("room-deck-unlock", { roomId: $create.roomId });
                    });
                });
            });

            it("should emit 'room-hand-unlock' when deck is locked and allow further associations with cards", (done: Function) => {
                // arrange
                let roomId: string;
                client.on("connect", () => {
                    // assert
                    client.on("room-hand-unlock", () => {
                        assert.isTrue(true);

                        client.emit("room-deck-card-associate",
                            { roomId: roomId, userId: client.id, cardId: "zero" },
                            ($data: RoomDeckCardAssociateCallbackArgs) => {
                                assert.isTrue($data.associated);
                                done();
                            });
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, { name: "George" }, ($create: CreateRoomCallbackArgs) => {
                        roomId = $create.roomId;
                        client.emit("room-deck-unlock", { roomId: $create.roomId });
                    });
                });
            });

            it("should emit 'room-hand-unlock' when deck is locked and allow further disassociations with cards", (done: Function) => {
                // arrange
                let roomId: string;
                client.on("connect", () => {
                    // assert
                    client.on("room-hand-unlock", () => {
                        assert.isTrue(true);

                        client.emit("room-deck-card-disassociate",
                            { roomId: roomId, userId: client.id, cardId: "zero" },
                            ($data: RoomDeckCardDisassociateCallbackArgs) => {
                                assert.isTrue($data.disassociated);
                                done();
                            });
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, { name: "George" }, ($create: CreateRoomCallbackArgs) => {
                        roomId = $create.roomId;
                        client.emit("room-deck-card-associate",
                            { roomId: roomId, userId: client.id, cardId: "zero" },
                            ($data: RoomDeckCardAssociateCallbackArgs) => {
                                assert.isTrue($data.associated);
                                client.emit("room-deck-unlock", { roomId: $create.roomId });
                            });
                    });
                });
            });

            it("should emit the 'internal-server-error' if other than moderator attempts to unlock deck", (done: Function) => {
                // arrange
                let newClient: SocketIOClient.Socket;
                let roomCreateEvent = new RoomCreateEvent({ name: "George" });
                client.on("connect", () => {
                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            // assert
                            newClient.on("internal-server-error", (error: Exception) => {
                                assert.isDefined(error.id);
                                assert.equal(error.message, "User does not have permission to unlock deck");
                                assert.equal("Error", error.name);
                                newClient.disconnect();
                                done();
                            });

                            let roomJoinEvent = new RoomJoinEvent({ name: "John", roomId: $create.roomId });
                            newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($join: RoomJoinCallbackArgs) => {
                                client.emit("room-deck-card-associate",
                                    { roomId: $create.roomId, userId: client.id, cardId: "zero" },
                                    ($clientData: RoomDeckCardAssociateCallbackArgs) => {
                                        newClient.emit("room-deck-card-associate",
                                            { roomId: $create.roomId, userId: newClient.id, cardId: "zero" },
                                            ($newClientData: RoomDeckCardDisassociateCallbackArgs) => {
                                                newClient.emit("room-deck-unlock", { roomId: $create.roomId });
                                            });
                                    });
                            });
                        });
                    });
                });
            });
        });

        describe("room-deck-reset", () => {
            it("should emit 'internal-server-error' for undefined data", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter data is required");
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit("room-deck-reset", undefined);
                });
            });

            it("should emit 'internal-server-error' for roomId empty", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter <Object>.roomId is required");
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit("room-deck-reset", { roomId: "" });
                });
            });

            it("should emit 'internal-server-error' for not found room", (done: Function) => {
                // arrange
                let roomId: string = "1234";
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, `Could not find room '${roomId}'`);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit("room-deck-reset", { roomId: roomId });
                });
            });

            it("should emit the 'room-deck-card-disassociate' event for each connected client", (done: Function) => {
                // arrange
                let newClient: SocketIOClient.Socket;
                let roomCreateEvent = new RoomCreateEvent({ name: "George" });
                client.on("connect", () => {
                    // assert
                    client.on("room-deck-card-disassociate", ($data: RoomDeckCardDisassociateCallbackArgs) => {
                        assert.isTrue($data.disassociated);
                        newClient.disconnect();
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            newClient.on("room-deck-card-disassociate", ($data: RoomDeckCardDisassociateCallbackArgs) => {
                                assert.isTrue($data.disassociated);
                            });

                            let roomJoinEvent = new RoomJoinEvent({ name: "John", roomId: $create.roomId });
                            newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($join: RoomJoinCallbackArgs) => {
                                client.emit("room-deck-card-associate",
                                    { roomId: $create.roomId, userId: client.id, cardId: "zero" },
                                    ($clientData: RoomDeckCardAssociateCallbackArgs) => {
                                        newClient.emit("room-deck-card-associate",
                                            { roomId: $create.roomId, userId: newClient.id, cardId: "zero" },
                                            ($newClientData: RoomDeckCardAssociateCallbackArgs) => {
                                                client.emit("room-deck-reset", { roomId: $create.roomId });
                                            });
                                    });
                            });
                        });
                    });
                });
            });

            it("should unlock the deck if previous locked", (done: Function) => {
                // arrange
                let roomId: string;
                client.on("connect", () => {
                    // assert
                    client.on("room-hand-unlock", () => {
                        assert.isTrue(true);

                        client.emit("room-deck-card-associate",
                            { roomId: roomId, userId: client.id, cardId: "zero" },
                            ($data: RoomDeckCardAssociateCallbackArgs) => {
                                assert.isTrue($data.associated);
                                done();
                            });
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, { name: "George" }, ($create: CreateRoomCallbackArgs) => {
                        roomId = $create.roomId;
                        client.emit("room-deck-lock", { roomId: roomId }, () => {
                            client.emit("room-deck-reset", { roomId: $create.roomId });
                        });
                    });
                });
            });

            it("should emit the 'internal-server-error' if other than moderator attempts to reset deck", (done: Function) => {
                // arrange
                let newClient: SocketIOClient.Socket;
                let roomCreateEvent = new RoomCreateEvent({ name: "George" });
                client.on("connect", () => {
                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
                        newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            // assert
                            newClient.on("internal-server-error", (error: Exception) => {
                                assert.isDefined(error.id);
                                assert.equal(error.message, "User does not have permission to reset deck");
                                assert.equal("Error", error.name);
                                newClient.disconnect();
                                done();
                            });

                            let roomJoinEvent = new RoomJoinEvent({ name: "John", roomId: $create.roomId });
                            newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($join: RoomJoinCallbackArgs) => {
                                client.emit("room-deck-card-associate",
                                    { roomId: $create.roomId, userId: client.id, cardId: "zero" },
                                    ($clientData: RoomDeckCardAssociateCallbackArgs) => {
                                        newClient.emit("room-deck-card-associate",
                                            { roomId: $create.roomId, userId: newClient.id, cardId: "zero" },
                                            ($newClientData: RoomDeckCardAssociateCallbackArgs) => {
                                                newClient.emit("room-deck-reset", { roomId: $create.roomId });
                                            });
                                    });
                            });
                        });
                    });
                });
            });
        });

        describe("room-deck-card-associate", () => {
            it("should emit 'internal-server-error' when data is undefined", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter data is required");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit("room-deck-card-associate", undefined, ($event: RoomDeckCardAssociateCallbackArgs) => {
                        assert.isFalse($event.associated);
                    });
                });
            });

            it("should emit 'internal-server-error' when roomId is undefined", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter <Object>.roomId is required");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit("room-deck-card-associate",
                        { roomId: "", userId: "user1", cardId: "card1" },
                        ($event: RoomDeckCardAssociateCallbackArgs) => {
                            assert.isFalse($event.associated);
                        });
                });
            });

            it("should emit 'internal-server-error' when userId is undefined", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter <Object>.userId is required");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit("room-deck-card-associate",
                        { roomId: "1234", userId: "", cardId: "card1" },
                        ($event: RoomDeckCardAssociateCallbackArgs) => {
                            assert.isFalse($event.associated);
                        });
                });
            });

            it("should emit 'internal-server-error' when cardId is undefined", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter <Object>.cardId is required");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit("room-deck-card-associate",
                        { roomId: "1234", userId: "user1", cardId: "" },
                        ($event: RoomDeckCardAssociateCallbackArgs) => {
                            assert.isFalse($event.associated);
                        });
                });
            });

            it("should emit 'internal-server-error' when room is not found", (done: Function) => {
                // arrange
                let roomId: string = "1234";
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, `Could not find room '${roomId}'`);
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit("room-deck-card-associate",
                        { roomId: roomId, userId: "user1", cardId: "card1" },
                        ($event: RoomDeckCardAssociateCallbackArgs) => {
                            assert.isFalse($event.associated);
                        });
                });
            });

            it("should emit 'internal-server-error' when user is not found", (done: Function) => {
                client.on("connect", () => {
                    // arrange
                    let roomId: string;
                    let userId: string = "non-existent";
                    let cardId: string = "card1";
                    let createRoomEvent = new RoomCreateEvent({ name: "George" });

                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, `Could not find user '${userId}' to associate with card '${cardId}'`);
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, createRoomEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        roomId = $create.roomId;
                        client.emit("room-deck-card-associate",
                            { roomId: roomId, userId: userId, cardId: cardId },
                            ($event: RoomDeckCardAssociateCallbackArgs) => {
                                assert.isFalse($event.associated);
                            });
                    });
                });
            });

            it("should emit 'internal-server-error' when user is not found", (done: Function) => {
                client.on("connect", () => {
                    // arrange
                    let roomId: string;
                    let userId: string = client.id;
                    let cardId: string = "non-existent";
                    let createRoomEvent = new RoomCreateEvent({ name: "George" });

                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, `Card '${cardId}' does not exist`);
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, createRoomEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        roomId = $create.roomId;
                        client.emit("room-deck-card-associate",
                            { roomId: roomId, userId: userId, cardId: cardId },
                            ($event: RoomDeckCardAssociateCallbackArgs) => {
                                assert.isFalse($event.associated);
                            });
                    });
                });
            });

            it("should associate card with user", (done: Function) => {
                client.on("connect", () => {
                    // arrange
                    let roomId: string;
                    let userId: string = client.id;
                    let cardId: string = "zero";
                    let createRoomEvent = new RoomCreateEvent({ name: "George" });

                    // act
                    client.emit(RoomCreateEvent.eventName, createRoomEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        roomId = $create.roomId;
                        client.emit("room-deck-card-associate",
                            { roomId: roomId, userId: userId, cardId: cardId },
                            ($event: RoomDeckCardAssociateCallbackArgs) => {
                                // assert
                                assert.isTrue($event.associated);
                                done();
                            });
                    });
                });
            });

            it("should not associate card with user when deck is locked", (done: Function) => {
                client.on("connect", () => {
                    // arrange
                    let roomId: string;
                    let userId: string = client.id;
                    let cardId: string = "zero";
                    let createRoomEvent = new RoomCreateEvent({ name: "George" });

                    // act
                    client.emit(RoomCreateEvent.eventName, createRoomEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        roomId = $create.roomId;
                        client.emit("room-deck-lock", { roomId: roomId }, () => {
                            client.emit("room-deck-card-associate",
                                { roomId: roomId, userId: userId, cardId: cardId },
                                ($event: RoomDeckCardAssociateCallbackArgs) => {
                                    // assert
                                    assert.isFalse($event.associated);
                                    done();
                                });
                        });
                    });
                });
            });
        });

        describe("room-deck-card-disassociate", () => {
            it("should emit 'internal-server-error' when data is undefined", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter data is required");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit("room-deck-card-disassociate", undefined, ($event: RoomDeckCardDisassociateCallbackArgs) => {
                        assert.isFalse($event.disassociated);
                    });
                });
            });

            it("should emit 'internal-server-error' when roomId is undefined", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter <Object>.roomId is required");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit("room-deck-card-disassociate",
                        { roomId: "", userId: "user1", cardId: "card1" },
                        ($event: RoomDeckCardDisassociateCallbackArgs) => {
                            assert.isFalse($event.disassociated);
                        });
                });
            });

            it("should emit 'internal-server-error' when userId is undefined", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter <Object>.userId is required");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit("room-deck-card-disassociate",
                        { roomId: "1234", userId: "", cardId: "card1" },
                        ($event: RoomDeckCardDisassociateCallbackArgs) => {
                            assert.isFalse($event.disassociated);
                        });
                });
            });

            it("should emit 'internal-server-error' when cardId is undefined", (done: Function) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, "Parameter <Object>.cardId is required");
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit("room-deck-card-disassociate",
                        { roomId: "1234", userId: "user1", cardId: "" },
                        ($event: RoomDeckCardDisassociateCallbackArgs) => {
                            assert.isFalse($event.disassociated);
                        });
                });
            });

            it("should emit 'internal-server-error' when room is not found", (done: Function) => {
                // arrange
                let roomId: string = "1234";
                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, `Could not find room '${roomId}'`);
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit("room-deck-card-disassociate",
                        { roomId: roomId, userId: "user1", cardId: "card1" },
                        ($event: RoomDeckCardDisassociateCallbackArgs) => {
                            assert.isFalse($event.disassociated);
                        });
                });
            });

            it("should emit 'internal-server-error' when user is not found", (done: Function) => {
                client.on("connect", () => {
                    // arrange
                    let roomId: string;
                    let userId: string = "non-existent";
                    let cardId: string = "card1";
                    let createRoomEvent = new RoomCreateEvent({ name: "George" });

                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, `Could not find user '${userId}' to disassociate with card '${cardId}'`);
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, createRoomEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        roomId = $create.roomId;
                        client.emit("room-deck-card-disassociate",
                            { roomId: roomId, userId: userId, cardId: cardId },
                            ($event: RoomDeckCardDisassociateCallbackArgs) => {
                                assert.isFalse($event.disassociated);
                            });
                    });
                });
            });

            it("should emit 'internal-server-error' when user is not found", (done: Function) => {
                client.on("connect", () => {
                    // arrange
                    let roomId: string;
                    let userId: string = client.id;
                    let cardId: string = "non-existent";
                    let createRoomEvent = new RoomCreateEvent({ name: "George" });

                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, `Card '${cardId}' does not exist`);
                        assert.equal(error.name, "Error");
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, createRoomEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        roomId = $create.roomId;
                        client.emit("room-deck-card-disassociate",
                            { roomId: roomId, userId: userId, cardId: cardId },
                            ($event: RoomDeckCardDisassociateCallbackArgs) => {
                                assert.isFalse($event.disassociated);
                            });
                    });
                });
            });

            it("should disassociate card from user", (done: Function) => {
                client.on("connect", () => {
                    // arrange
                    let roomId: string;
                    let userId: string = client.id;
                    let cardId: string = "zero";
                    let createRoomEvent = new RoomCreateEvent({ name: "George" });

                    // act
                    client.emit(RoomCreateEvent.eventName, createRoomEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        roomId = $create.roomId;
                        client.emit("room-deck-card-associate",
                            { roomId: roomId, userId: userId, cardId: cardId },
                            ($event: RoomDeckCardAssociateCallbackArgs) => {
                                assert.isTrue($event.associated);
                                client.emit("room-deck-card-disassociate",
                                    { roomId: roomId, userId: userId, cardId: cardId },
                                    ($event: RoomDeckCardDisassociateCallbackArgs) => {
                                        // assert
                                        assert.isTrue($event.disassociated);
                                        done();
                                    });
                            });
                    });
                });
            });

            it("should not disassociate card from user when user is not associated in first place", (done: Function) => {
                client.on("connect", () => {
                    // arrange
                    let roomId: string;
                    let userId: string = client.id;
                    let cardId: string = "zero";
                    let createRoomEvent = new RoomCreateEvent({ name: "George" });

                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
                        assert.isDefined(error.id);
                        assert.equal(error.message, `User with id '${userId}' is not associated with card '${cardId}'`);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, createRoomEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        roomId = $create.roomId;
                        client.emit("room-deck-card-disassociate",
                            { roomId: roomId, userId: userId, cardId: cardId },
                            ($event: RoomDeckCardDisassociateCallbackArgs) => {
                                assert.isFalse($event.disassociated);
                            });
                    });
                });
            });

            it("should not disassociate card with user when deck is locked", (done: Function) => {
                client.on("connect", () => {
                    // arrange
                    let roomId: string;
                    let userId: string = client.id;
                    let cardId: string = "zero";
                    let createRoomEvent = new RoomCreateEvent({ name: "George" });

                    // assert
                    client.on("room-hand-lock", () => {
                        client.emit("room-deck-card-disassociate",
                            { roomId: roomId, userId: userId, cardId: cardId },
                            ($event: RoomDeckCardDisassociateCallbackArgs) => {
                                assert.isFalse($event.disassociated);
                                done();
                            });
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, createRoomEvent.data, ($create: CreateRoomCallbackArgs) => {
                        assert.isTrue($create.access);
                        roomId = $create.roomId;
                        client.emit("room-deck-card-associate",
                            { roomId: roomId, userId: userId, cardId: cardId },
                            ($data: RoomDeckCardAssociateCallbackArgs) => {
                                assert.isTrue($data.associated);
                                client.emit("room-deck-lock", { roomId: roomId });
                            });
                    });
                });
            });
        });
    });
});