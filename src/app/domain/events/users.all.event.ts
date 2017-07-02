import { Event } from "./event";

export class UsersAllEvent {
    static readonly eventName: string = Event.UsersAll;
    constructor(public readonly users: number) { }
}
