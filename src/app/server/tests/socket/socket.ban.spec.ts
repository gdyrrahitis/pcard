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
    })
});