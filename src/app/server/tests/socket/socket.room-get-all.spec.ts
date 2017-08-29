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
    })
});