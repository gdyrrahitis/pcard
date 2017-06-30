import { Event } from "./event";

export class RoomDisconnectEvent {
    static readonly eventName: string = Event.RoomDisconnect;
    constructor(public readonly data: { roomId: string, userId: string }) { }
}