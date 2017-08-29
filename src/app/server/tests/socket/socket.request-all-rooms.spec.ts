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
    })
});