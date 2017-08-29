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
    })
});