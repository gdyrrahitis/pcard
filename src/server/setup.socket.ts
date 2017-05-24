import { Socket } from "./socket.io/socket";
import * as socketIo from "socket.io";
import * as http from "http";

export function registerSocketIo(server: http.Server): http.Server {
    let io = socketIo(server);
    let socket = new Socket(io);
    socket.connect();

    return server;
}