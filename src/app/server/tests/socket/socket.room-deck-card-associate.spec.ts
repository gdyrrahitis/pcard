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
    })
});