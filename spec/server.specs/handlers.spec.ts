import { ServerHandlers } from "../../server/socket.io/handlers";
var socketMock = require("socket-io-mock");

describe("Socket.io subscriber disconnect handler", () => {
    var socket,
        connections: Connection[] = [
            { id: "1", room: "1", moderator: true, userId: "" },
            { id: "2", room: "1", moderator: false, userId: "" },
            { id: "3", room: "1", moderator: false, userId: "" }
        ],
        handler: ServerHandlers;

    beforeEach(() => {
        socket = new socketMock();
        socket.server = {
            to: function (input: string) {
                return socket;
            }
        }
        spyOn(socket.server, "to").and.callThrough();
    });

    it("should broadcast to private-1 room and emit 'show-attendees' event with rooms - 1", () => {
        // Arrange
        socket.id = "2";
        socket.socketClient.on("show-attendees", (data) => {
            // Early assertion on event
            expect(data).toEqual([
                { id: "1", room: "1", moderator: true, userId: "" },
                { id: "3", room: "1", moderator: false, userId: "" }
            ]);
        });
        handler = new ServerHandlers(connections, socket);

        // Act
        handler.disconnect();

        // Assertion
        expect(socket.server.to).toHaveBeenCalled();
    });

    it("should not broadcast to private-1 room because room provided was not found", () => {
        // Arrange
        socket.id = "5";
        handler = new ServerHandlers(connections, socket);

        // Act
        handler.disconnect();

        // Assertion
        expect(socket.server.to).not.toHaveBeenCalled();
    });
});

describe("Socket.io subscriber createPrivateRoom handler", () => {
    var socket,
        connections: Connection[] = [
            { id: "1", room: "1", moderator: true, userId: "" },
            { id: "2", room: "1", moderator: false, userId: "" },
            { id: "3", room: "1", moderator: false, userId: "" }
        ],
        handler: ServerHandlers;

    beforeEach(() => {
        socket = new socketMock();
        socket.server = {
            to: function (input: string) {
                return socket;
            }
        }
        spyOn(socket.server, "to").and.callThrough();
    });

    it("should emit 'room-occupied' event for room already created", () => {
        // Arrange
        let data = { room: "1" };
        let callbackSpy = jasmine.createSpy("callback", (data: { access: boolean }) => { });
        handler = new ServerHandlers(connections, socket.socketClient);
        socket.socketClient.on("room-occupied", (data: any) => {
            // Assert
            expect(data).not.toBeNull();
            expect(data.access).toBeFalsy();
        });

        // Act
        handler.createPrivateRoom(data, callbackSpy);

        // Assert
        expect(callbackSpy).toHaveBeenCalled();
        expect(callbackSpy.calls.count()).toEqual(1);
        expect(callbackSpy).toHaveBeenCalledWith({ access: false });
    });

    it("should push new connection to existing connections collection", () => {
        // Arrange
        let userId = "5";
        let data = {
            room: "2",
            userId: ""
        }
        let callbackSpy = jasmine.createSpy("callback", (data: { access: boolean }) => { });
        socket.id = userId;
        handler = new ServerHandlers(connections, socket);
        socket.socketClient.on("show-attendees", (data) => {
            // Assert
            expect(data).not.toBeNull();
            expect(data.length).toBe(4);
            expect(data[3]).toEqual({ id: "5", room: "2", moderator: true, userId: "" });
        });

        // Act
        handler.createPrivateRoom(data, callbackSpy);
    });
});

describe("Socket.io subscriber joinPrivateRoom handler", () => {
    var socket,
        connections: Connection[],
        handler: ServerHandlers;

    beforeEach(() => {
        connections = [
            { id: "1", room: "1", moderator: true, userId: "" },
            { id: "2", room: "1", moderator: false, userId: "" },
            { id: "3", room: "1", moderator: false, userId: "" }
        ];
        socket = new socketMock();
        socket.server = {
            to: function (input: string) {
                return socket;
            }
        }
        spyOn(socket.server, "to").and.callThrough();
    });

    it("should not find a matching room, emitting 'room-not-found' event.", () => {
        // Arrange
        let data = { room: "2" };
        let callbackSpy = jasmine.createSpy("callback", (data: { access: boolean }) => { });
        spyOn(socket, "emit").and.callThrough();
        handler = new ServerHandlers(connections, socket);

        // Act
        handler.joinPrivateRoom(data, callbackSpy);

        // Assert
        expect(callbackSpy).toHaveBeenCalledWith({ access: false });
        expect(socket.emit).toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith("room-not-found");
    });

    it("should join socket to designated private room after successful lookup", () => {
        // Arrange
        let data = { room: "1" };
        let callbackSpy = jasmine.createSpy("callback", (data: { access: boolean }) => { });
        spyOn(socket, "join");
        handler = new ServerHandlers(connections, socket);

        // Act
        handler.joinPrivateRoom(data, callbackSpy);

        // Assert
        expect(socket.join).toHaveBeenCalled();
        expect(socket.join).toHaveBeenCalledWith("private-1");
    });

    it("should emit 'show-attendees' event with an added connection", () => {
        // Arrange
        let data = { room: "1", userId: "", moderator: false };
        let callbackSpy = jasmine.createSpy("callback", (data: { access: boolean }) => { });
        socket.id = "5";
        handler = new ServerHandlers(connections, socket);
        socket.socketClient.on("show-attendees", (data) => {
            // Assert
            expect(data).not.toBeNull();
            expect(data.length).toBe(4);
            expect(data[3]).toEqual({ id: "5", room: "1", moderator: false, userId: "" });
        });

        // Act
        handler.joinPrivateRoom(data, callbackSpy);

        // Assert
        expect(socket.server.to).toHaveBeenCalled();
        expect(socket.server.to).toHaveBeenCalledWith("private-1");
        expect(callbackSpy).toHaveBeenCalledWith({ access: true });
    });
});

describe("Socket.io subscriber leavePrivateRoom handler", () => {
    var socket,
        connections: Connection[],
        handler: ServerHandlers;

    beforeEach(() => {
        connections = [
            { id: "1", room: "1", moderator: true, userId: "1" },
            { id: "2", room: "1", moderator: false, userId: "2" },
            { id: "3", room: "1", moderator: false, userId: "3" }
        ];
        socket = new socketMock();
        socket.server = {
            to: function (input: string) {
                return socket;
            }
        }
        spyOn(socket.server, "to").and.callThrough();
    });

    it("should not emit message to room if connection is not found", () => {
        // Arrange
        let data = {};
        spyOn(socket, "emit");
        handler = new ServerHandlers(connections, socket);

        // Act
        handler.leavePrivateRoom(data);

        // Assert
        expect(socket.server.to).not.toHaveBeenCalled();
        expect(socket.emit).not.toHaveBeenCalled();
    });

    it("should find the room and emit 'show-attendees' event", () => {
        // Arrange
        let data = { id: "2" };
        spyOn(socket, "emit").and.callThrough();
        handler = new ServerHandlers(connections, socket);
        socket.on("show-attendees", (data) => {
            // Assert
            expect(data).not.toBeNull();
            expect(data.length).toBe(2);
        });

        // Act
        handler.leavePrivateRoom(data);

        // Assert
        expect(socket.server.to).toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalled();
    });
});


describe("Socket.io subscriber ban handler", () => {
    var socket,
        connections: Connection[],
        handler: ServerHandlers;

    beforeEach(() => {
        connections = [
            { id: "1", room: "1", moderator: true, userId: "1" },
            { id: "2", room: "1", moderator: false, userId: "2" },
            { id: "3", room: "1", moderator: false, userId: "3" }
        ];
        socket = new socketMock();
        socket.server = {
            to: function (input: string) {
                return socket;
            }
        }
        spyOn(socket.server, "to").and.callThrough();
    });

    it("should not emit message to room if connection is not found", () => {
        // Arrange
        let data = {};
        spyOn(socket, "emit");
        handler = new ServerHandlers(connections, socket);

        // Act
        handler.ban(data);

        // Assert
        expect(socket.server.to).not.toHaveBeenCalled();
        expect(socket.emit).not.toHaveBeenCalled();
    });

    it("should find the room and emit 'show-attendees' event", () => {
        // Arrange
        let data = { userId: "2" };
        spyOn(socket, "emit").and.callThrough();
        handler = new ServerHandlers(connections, socket);
        socket.on("show-attendees", (data) => {
            // Assert
            expect(data).not.toBeNull();
            expect(data.length).toBe(2);
        });

        // Act
        handler.ban(data);

        // Assert
        expect(socket.server.to).toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalled();
        expect(socket.server.to).toHaveBeenCalledTimes(2);
        expect(socket.server.to.calls.argsFor(0)).toEqual(["2"]);
        expect(socket.server.to.calls.argsFor(1)).toEqual(["private-1"]);
        expect(socket.emit.calls.argsFor(0)).toEqual(["user-banned"]);
        expect(socket.emit.calls.argsFor(1)).toEqual(["show-attendees", [
            { id: "1", room: "1", moderator: true, userId: "1" },
            { id: "3", room: "1", moderator: false, userId: "3" }
        ]]);
    });
});