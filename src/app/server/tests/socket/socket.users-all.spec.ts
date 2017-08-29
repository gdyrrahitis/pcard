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
    })
});