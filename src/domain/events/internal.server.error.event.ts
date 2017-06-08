import { IEvent } from "./event";

export class InternalServerErrorEvent implements IEvent {
    public name: string = "internal-server-error";
}