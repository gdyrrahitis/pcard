import { Event } from "./event";

export class RoomCreateEvent {
    static readonly eventName: string = Event.RoomCreate;
    constructor(public readonly data: { name: string }) { }
}