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

    xit("should not broadcast to private-1 room because room provided was not found", () => {
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