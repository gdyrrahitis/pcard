import * as chai from "chai";

export const assert = chai.assert;
export const socketUrl: string = "http://localhost:5000";
export const options: SocketIOClient.ConnectOpts = {
    transports: ['websocket'],
    'force new connection': true
};