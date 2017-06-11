import { Event } from "./event";

export class InternalServerErrorEvent {
    static eventName: string = Event.InternalServerError;
    constructor(public readonly error: any) { }
}