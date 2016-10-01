import { Mappings } from "./mappings";
import { ServerHandlers } from "./handlers";

export class Socket {
    private rooms = [];
    private maxRoomsAllowed: number = 1;

    constructor(private io: SocketIO.Server) { }

    connect() {
        let that = this;
        that.io.on("connection", function (socket: ISocket) {
            console.log("New connection made to server." + socket.id);
            let handlers = new ServerHandlers(that.rooms, socket);
            let mappings = new Mappings(handlers);
            let events = mappings.getMappingsByEvent();

            events.forEach((event) => socket.on(event.key, event.item));
        });
    }
}