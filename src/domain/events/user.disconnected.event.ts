import { IEvent } from "./event";

export class UserDisconnectedEvent implements IEvent {
    public name: string = "user-disconnected";
}