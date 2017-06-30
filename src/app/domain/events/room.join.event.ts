import { Event } from "./event";

export class RoomJoinEvent {
    static readonly eventName: string = Event.RoomJoin;
    constructor(public readonly data: { name: string, roomId: string }) { }
}