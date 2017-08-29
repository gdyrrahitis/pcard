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
    })
});