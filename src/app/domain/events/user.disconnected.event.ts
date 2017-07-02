import { Event } from "./event";

export class UserDisconnectedEvent {
    static readonly eventName: string = Event.UserDisconnected;
    constructor(public readonly roomId: string) { }
}