import { ServerHandlers } from "./handlers";

export class Mappings {
    private mappings: Tuple[];
    
    constructor(private handlers: ServerHandlers) { 
        this.mappings = [
            {
                key: "disconnect",
                item: this.handlers.disconnect
            },
            {
                key: "create-private",
                item: this.handlers.createPrivateRoom
            },
            {
                key: "join-private",
                item: this.handlers.joinPrivateRoom
            },
            {
                key: "private-leave",
                item: this.handlers.leavePrivateRoom
            },
            {
                key: "ban",
                item: this.handlers.ban
            },
            {
                key: "get-all-attendees",
                item: this.handlers.getAllConnectedUsers
            }
        ];
    }

    getMappingsByEvent() {
        return this.mappings;
    }
}