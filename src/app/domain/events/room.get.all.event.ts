import { Event } from "./event";

export class RoomGetAllEvent {
    static readonly eventName: string = Event.RoomGetAll;
    constructor(public readonly data: { roomId: string }) { }
}