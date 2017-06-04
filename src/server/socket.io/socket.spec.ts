// import { Socket } from "./socket";
// import * as SocketMock from "socket-io-mock";

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