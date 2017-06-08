import { IEvent } from "./event";

export class RoomNotFoundEvent implements IEvent {
    public name: string = "room-not-found";
}