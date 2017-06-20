import * as ioClient from "socket.io-client";
import * as io from "socket.io";
import * as chai from "chai";
import { Socket } from "../socket.io/socket";
const assert = chai.assert;
const socketUrl: string = "http://localhost:5000";
const options: SocketIOClient.ConnectOpts = {
    transports: ['websocket'],
    'force new connection': true
};

describe("Server", () => {
    describe("Socket", () => {
        describe("connect", () => {
            it("should connect socket", (done) => {
                var server = io().listen(5000);
                new Socket(server).connect();
                var socket = ioClient.connect(socketUrl, options);
                socket.on("connect", () => {
                    assert.equal(socket.connected, true);
                    socket.disconnect();
                    done();
                });
            });
        });
    });
});

// describe("Server", () => {
//     describe("Socket", () => {
//         describe("connect", () => {
//             describe("room-create", () => {
//                 let socket: Socket;
//                 let socketMock;

//                 beforeEach(() => {
//                     let ioMock = new SocketMock();
//                     socketMock = new SocketMock();
//                     socket = new Socket(ioMock);
//                     ioMock.emit("connection", socketMock);
//                 });

//                 it("should create room", () => {
//                     // arrange
//                     let data = { id: 1, name: "George" };

//                     // act
//                     socketMock.emit("room-create", data, (response) => {
//                         // assert
//                         expect(response.access).toBeTruthy();
//                         expect(response.roomId).toBeDefined();
//                     });
//                 });

//                 it("should emit rooms-full event and access of false for having all rooms occupied", () => {

//                 });
//             });

//             describe("disconnect", () => { });

//             describe("room-join", () => { });

//             describe("room-leave", () => { });

//             describe("ban", () => { });

//             describe("room-get-all", () => { });
//         });
//     });
// });