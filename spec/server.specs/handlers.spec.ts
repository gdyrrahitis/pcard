import { ServerHandlers } from "../../server/socket.io/handlers";
var socketMock = require("socket-io-mock");

describe("Socket.io subscriber disconnect handler", () => {
    var socket,
        rooms = [{ id: 1, room: 1 }, { id: 2, room: 1 }, { id: 3, room: 2 }],
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
        socket.socketClient.id = 2;
        socket.on("show-attendees", (data) => {
            // TODO: Handler is not called
            // Early assertion on event
            console.log("Callback")
            expect(false).toBeTruthy();
            expect(data).toEqual([{ id: 1, room: 1 }, { id: 3, room: 2 }])
        });
        handler = new ServerHandlers(rooms, socket.socketClient);

        // Act
        handler.disconnect();

        // Assertion
        expect(socket.socketClient.server.to).toHaveBeenCalled();
    });

    it("should not broadcast to private-1 room because room provided was not found", () => {
        // Arrange
        socket.socketClient.id = 5;
        handler = new ServerHandlers(rooms, socket.socketClient);

        // Act
        handler.disconnect();

        // Assertion
        expect(socket.socketClient.server.to).not.toHaveBeenCalled();
    });
});