import { ServerHandlers } from "../../server/socket.io/handlers";
var socketMock = require("socket-io-mock");

describe("Socket.io subscriber disconnect handler", () => {
    var socket,
        rooms: Connection[] = [
            { id: "1", room: "1", moderator: true, userId: "" },
            { id: "2", room: "1", moderator: false, userId: "" },
            { id: "3", room: "2", moderator: false, userId: "" }
        ],
        handler: ServerHandlers;

    beforeEach(() => {
        socket = new socketMock();
        socket.socketClient.server = {
            to: function (input: string) {
                return socket;
            }
        }
        spyOn(socket.socketClient.server, "to").and.callThrough();
    });

    it("should broadcast to private-1 room and emit 'show-attendees' event with rooms - 1", () => {
        // Arrange
        socket.socketClient.id = "2";
        socket.socketClient.on("show-attendees", (data) => {
            // Early assertion on event
            expect(data).toEqual([
                { id: "1", room: "1", moderator: true, userId: "" },
                { id: "3", room: "2", moderator: false, userId: "" }
            ]);
        });
        handler = new ServerHandlers(rooms, socket.socketClient);

        // Act
        handler.disconnect();

        // Assertion
        expect(socket.socketClient.server.to).toHaveBeenCalled();
    });

    it("should not broadcast to private-1 room because room provided was not found", () => {
        // Arrange
        socket.socketClient.id = "5";
        handler = new ServerHandlers(rooms, socket.socketClient);

        // Act
        handler.disconnect();

        // Assertion
        expect(socket.socketClient.server.to).not.toHaveBeenCalled();
    });
});

describe("Socket.io subscriber createPrivateRoom handler", () => {
    var socket,
        rooms: Connection[] = [
            { id: "1", room: "1", moderator: true, userId: "" },
            { id: "2", room: "1", moderator: false, userId: "" },
            { id: "3", room: "2", moderator: false, userId: "" }
        ],
        handler: ServerHandlers;

    beforeEach(() => {
        socket = new socketMock();
        socket.socketClient.server = {
            to: function (input: string) {
                return socket;
            }
        }
        spyOn(socket.socketClient.server, "to").and.callThrough();
    });

    it("should emit 'room-occupied' event for room already created", () => {
        // Arrange
        let data = { room: "1" };
        let callbackSpy = jasmine.createSpy("callback", (data: { access: boolean }) => { });
        handler = new ServerHandlers(rooms, socket.socketClient);
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
});