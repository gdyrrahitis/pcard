/// <reference path="../../globals/socket.io/index.d.ts" />

declare interface ISocket extends SocketIO.Socket {
    room: string;
}