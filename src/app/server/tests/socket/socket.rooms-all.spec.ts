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
    })
});