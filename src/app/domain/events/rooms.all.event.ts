import { Event } from "./event";

export class RoomsAllEvent {
    static readonly eventName: string = Event.RoomsAll;
    constructor(public readonly rooms: number) { }
}
