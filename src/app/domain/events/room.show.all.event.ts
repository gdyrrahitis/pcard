import { UserRole } from "../index";
import { Event } from "./event";

export class RoomShowAllEvent {
    static readonly eventName: string = Event.RoomShowAll;
    constructor(public readonly users: UserRole[]) { }
}
