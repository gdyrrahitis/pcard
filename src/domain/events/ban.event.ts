import { Event } from "./event";

export class BanEvent {
    static readonly eventName: string = Event.Ban;

    constructor(public readonly data: { roomId: string, userId: string }) { }
}