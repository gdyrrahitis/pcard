import { Event } from "./event";

export class ModalJoinResultEvent {
    static readonly eventName: string = Event.ModalJoinResult;
    constructor(public readonly result: string) { }
}