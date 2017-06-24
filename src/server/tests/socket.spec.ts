import * as ioClient from "socket.io-client";
import * as io from "socket.io";
import * as chai from "chai";
import { Socket } from "../socket.io/socket";
import { UserRole } from "../../domain/index";
import {
    RoomCreateEvent, RoomGetAllEvent, InternalServerErrorEvent, RoomShowAllEvent,
    RoomsAllEvent, UsersAllEvent, RoomNotFoundEvent, RoomJoinEvent, RequestAllRoomsEvent,
    RequestAllUsersEvent
} from "../../domain/events/index";

const assert = chai.assert;
const socketUrl: string = "http://localhost:5000";
const options: SocketIOClient.ConnectOpts = {
    transports: ['websocket'],
    'force new connection': true
};
const isGuid = (data: string) => /^[{]?[0-9a-fA-F]{8}[-]?([0-9a-fA-F]{4}[-]?){3}[0-9a-fA-F]{12}[}]?$/.test(data);
const getFirstRoomThatMatchesGuidPattern = (rooms: { [room: string]: { sockets: { [id: string]: boolean }, length: number } }) => {
    for (var room in rooms) {
        if (!rooms[room].hasOwnProperty(room)) {
            if (isGuid(room)) {
                return room;
            }
        }
    }
}

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
            it("should connect socket", (done) => {
                client.on("connect", () => {
                    assert.equal(client.connected, true);
                    client.disconnect();
                    done();
                });
            });
        });

        describe("room-create", () => {
            it("should emit internal-server-error event for empty name and access should be false", (done) => {
                // arrange
                let expectedParameter: string = "name";
                let roomCreateEventArgs: { name: string } = { name: "" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);

                client.on("connect", () => {
                    // assert
                    client.on(InternalServerErrorEvent.eventName, (error) => {
                        assert.isDefined(error.id);
                        assert.equal(`Parameter ${expectedParameter} is required`, error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($value: { access: boolean, roomId: string }) => {
                        assert.equal(false, $value.access);
                        assert.isUndefined($value.roomId);
                    });
                });
            });

            it("should emit 'room-show-all', 'rooms-all' and 'users-all' events when creating new room", (done) => {
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
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($value: { access: boolean, roomId: string }) => {
                        assert.equal(true, $value.access);
                        assert.isDefined($value.roomId);
                    });
                });
            });

            it("should create two rooms with one user on each room", (done) => {
                // arrange
                let event: "room-create-1" | "room-create-2";
                let george: string = "George";
                let john: string = "John";
                let georgeCreateRoomEvent = new RoomCreateEvent({ name: george });
                let johnCreateRoomEvent = new RoomCreateEvent({ name: john });

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
                            done();
                        }
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, georgeCreateRoomEvent.data, ($value: { access: boolean, roomId: string }) => {
                        event = "room-create-1";
                        assert.equal(true, $value.access);
                        assert.isDefined($value.roomId);
                    });

                    client.emit(RoomCreateEvent.eventName, johnCreateRoomEvent.data, ($value: { access: boolean, roomId: string }) => {
                        event = "room-create-2";
                        assert.equal(true, $value.access);
                        assert.isDefined($value.roomId);
                    });
                });
            });
        });

        describe("room-join", () => {
            it("should emit 'room-not-found' event when room does not exist", (done) => {
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
                    client.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($value: { access: boolean }) => {
                        assert.isFalse($value.access);
                        isCallbackCalled = true;
                    });
                });
            });

            it("should emit 'internal-server-error' when same socket tries to join room", (done) => {
                client.on("connect", () => {
                    // assert
                    let rooms = server.sockets.adapter.rooms;
                    let roomJoinEventArgs: { roomId: string, name: string };
                    let roomJoinEvent: RoomJoinEvent;
                    let roomCreateEventArgs: { name: string } = { name: "George" };
                    let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);

                    client.on(InternalServerErrorEvent.eventName, (error) => {
                        assert.isDefined(error.id);
                        assert.equal("Cannot add user with same id", error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        let roomId = getFirstRoomThatMatchesGuidPattern(rooms);
                        roomJoinEventArgs = { roomId: roomId, name: "George" };
                        roomJoinEvent = new RoomJoinEvent(roomJoinEventArgs);

                        client.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($value: { access: boolean }) => {
                            assert.isFalse($value.access);
                        });
                    });
                });
            });

            it("should emit 'internal-server-error' when data is not defined for room-create event", (done) => {
                client.on("connect", () => {
                    // assert
                    let rooms = server.sockets.adapter.rooms;
                    let roomJoinEventArgs: { roomId: string, name: string };
                    let roomJoinEvent: RoomJoinEvent;
                    let roomCreateEventArgs: { name: string } = { name: "George" };
                    let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);

                    client.on(InternalServerErrorEvent.eventName, (error) => {
                        assert.isDefined(error.id);
                        assert.equal("Parameter data is required", error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        client.emit(RoomJoinEvent.eventName, undefined, ($value: { access: boolean }) => {
                            assert.isFalse($value.access);
                        });
                    });
                });
            });

            it("should emit 'internal-server-error' when data is null for room-create event", (done) => {
                client.on("connect", () => {
                    // assert
                    let rooms = server.sockets.adapter.rooms;
                    let roomJoinEventArgs: { roomId: string, name: string };
                    let roomJoinEvent: RoomJoinEvent;
                    let roomCreateEventArgs: { name: string } = { name: "George" };
                    let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);

                    client.on(InternalServerErrorEvent.eventName, (error) => {
                        assert.isDefined(error.id);
                        assert.equal("Parameter data is required", error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        client.emit(RoomJoinEvent.eventName, null, ($value: { access: boolean }) => {
                            assert.isFalse($value.access);
                        });
                    });
                });
            });

            it("should emit 'internal-server-error' when room is undefined or empty", (done) => {
                client.on("connect", () => {
                    // assert
                    let rooms = server.sockets.adapter.rooms;
                    let roomJoinEventArgs: { roomId: string, name: string };
                    let roomJoinEvent: RoomJoinEvent;
                    let roomCreateEventArgs: { name: string } = { name: "George" };
                    let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);

                    client.on(InternalServerErrorEvent.eventName, (error) => {
                        assert.isDefined(error.id);
                        assert.equal("Parameter <Object>.roomId is required", error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        roomJoinEventArgs = { roomId: undefined, name: "John" };
                        roomJoinEvent = new RoomJoinEvent(roomJoinEventArgs);

                        client.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($value: { access: boolean }) => {
                            assert.isFalse($value.access);
                        });
                    });
                });
            });

            it("should emit 'internal-server-error' when name is not defined", (done) => {
                client.on("connect", () => {
                    // assert
                    let rooms = server.sockets.adapter.rooms;
                    let roomJoinEventArgs: { roomId: string, name: string };
                    let roomJoinEvent: RoomJoinEvent;
                    let roomCreateEventArgs: { name: string } = { name: "George" };
                    let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);

                    client.on(InternalServerErrorEvent.eventName, (error) => {
                        assert.isDefined(error.id);
                        assert.equal("Parameter <Object>.name is required", error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        let roomId = getFirstRoomThatMatchesGuidPattern(rooms);
                        roomJoinEventArgs = { roomId: roomId, name: undefined };
                        roomJoinEvent = new RoomJoinEvent(roomJoinEventArgs);

                        client.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($value: { access: boolean }) => {
                            assert.isFalse($value.access);
                        });
                    });
                });
            });

            it("should add user to valid room, allow access and emits 'users-all' event to update global list of users", (done) => {
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
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        status = "room-create";
                        let roomId = getFirstRoomThatMatchesGuidPattern(rooms);
                        roomJoinEventArgs = { roomId: roomId, name: john };
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
                                done();
                            });

                            newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($value: { access: boolean }) => {
                                assert.isTrue($value.access);
                            });
                        });
                    });
                });
            });
        });

        describe("room-disconnect", () => { });

        describe("ban", () => { });

        describe("room-get-all", () => {
            it("should emit internal server error no rooms have been created", (done) => {
                // arrange
                let roomId: string = "invalid";
                let roomGetAllEventArgs: { roomId: string } = { roomId: roomId };
                let roomGetAllEvent = new RoomGetAllEvent(roomGetAllEventArgs);

                client.on("connect", () => {
                    // assert
                    client.once(InternalServerErrorEvent.eventName, (error) => {
                        assert.isDefined(error.id);
                        assert.equal(`Could not find room '${roomId}'`, error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomGetAllEvent.eventName, roomGetAllEvent.data);
                });
            });

            it("should emit internal server error when no data is passed", (done) => {
                // arrange
                client.on("connect", () => {
                    // assert
                    client.once(InternalServerErrorEvent.eventName, (error) => {
                        assert.isDefined(error.id);
                        assert.equal("Parameter <Object>.roomId is required", error.message);
                        assert.equal("Error", error.name);
                        done();
                    });

                    // act
                    client.emit(RoomGetAllEvent.eventName);
                });
            });

            it("should emit internal server error when room is not found", (done) => {
                // arrange
                let roomId: string = "fake";
                let roomCreateEventArgs: { name: string } = { name: "George" };
                let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
                let roomGetAllEventArgs: { roomId: string } = { roomId: roomId };
                let roomGetAllEvent = new RoomGetAllEvent(roomGetAllEventArgs);

                client.on("connect", () => {
                    // assert
                    client.once(InternalServerErrorEvent.eventName, (error) => {
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

            it("should emit 1 when one user is in room", (done) => {
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
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        roomId = getFirstRoomThatMatchesGuidPattern(rooms);
                        roomGetAllEventArgs = { roomId: roomId };
                        roomGetAllEvent = new RoomGetAllEvent(roomGetAllEventArgs);

                        client.emit(RoomGetAllEvent.eventName, roomGetAllEvent.data);
                    });
                });
            });
        });

        describe("request-all-rooms", () => {
            it("should return 0 when no room is created", (done) => {
                client.on("connect", () => {
                    client.on(RoomsAllEvent.eventName, (rooms: number) => {
                        assert.equal(0, rooms);
                        done();
                    });

                    client.emit(RequestAllRoomsEvent.eventName);
                });
            });

            it("should return 1 when one room is created", (done) => {
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

            it("should return 2 when two rooms are created", (done) => {
                // arrange
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
                            done();
                        }
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        let newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            status = "after:new-room-created";
                            newClient.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => { });
                        });
                    });
                    client.emit(RequestAllRoomsEvent.eventName);
                });
            });
        });

        describe("rooms-all", () => {
            it("should return 0 users when no room is created", (done) => {
                client.on("connect", () => {
                    client.on(UsersAllEvent.eventName, (users: number) => {
                        assert.equal(0, users);
                        done();
                    });

                    client.emit(RequestAllUsersEvent.eventName);
                });
            });

            it("should return total 1 user when one room is created", (done) => {
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
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => { });
                    client.emit(RequestAllUsersEvent.eventName);
                });
            });

            it("should return total 2 users when two rooms are created", (done) => {
                // arrange
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
                            done();
                        }
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => {
                        let newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            status = "after:new-room-created";
                            newClient.emit(RoomCreateEvent.eventName, roomCreateEvent.data, () => { });
                        });
                    });
                    client.emit(RequestAllUsersEvent.eventName);
                });
            });

            it("should return total 2 users when one room is created and user has joined", (done) => {
                // arrange
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
                            done();
                        }
                    });

                    client.on(RoomsAllEvent.eventName, (rooms: number) => {
                        assert.equal(1, rooms);
                    });

                    // act
                    client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($value: { access: boolean }) => {
                        assert.isTrue($value.access);
                        let roomId = getFirstRoomThatMatchesGuidPattern(rooms);
                        let roomJoinEvent = new RoomJoinEvent({ name: "John", roomId: roomId });

                        let newClient = ioClient.connect(socketUrl, options);
                        newClient.on("connect", () => {
                            status = "room-join";
                            newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($value: { access: boolean }) => {
                                assert.isTrue($value.access);
                            });
                        });
                    });
                    client.emit(RequestAllUsersEvent.eventName);
                });
            });
        });

        describe("users-all", () => { });

        describe("room-busy", () => { });

        describe("room-free", () => { });

        describe("room-deck-lock", () => { });

        describe("room-deck-unlock", () => { });

        describe("room-deck-reset", () => { });

        describe("room-deck-card-associate", () => { });

        describe("room-deck-card-disassociate", () => { });
    });
});