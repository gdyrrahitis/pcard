import { IEvent } from "./event";

export class RoomsFullEvent implements IEvent {
    public name: string = "rooms-full";
}