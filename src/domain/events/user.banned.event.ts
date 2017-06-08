import { IEvent } from "./event";

export class UserBannedEvent implements IEvent {
    public name: string = "user-banned";
}