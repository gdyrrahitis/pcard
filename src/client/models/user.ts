import { Role } from "./role";

export interface UserRole extends User {
    readonly role: Role;
}

export interface User {
    id: string;
    name: string;
}

export class Moderator implements UserRole {
    public readonly role: Role;
    constructor(public id: string, public name: string) {
        if (!id) {
            throw new Error("Parameter id is required");
        }

        if (!name) {
            throw new Error("Parameter name is required");
        }

        this.role = new Role("moderator");
    }
}

export class Guest implements UserRole {
    public readonly role: Role;
    constructor(public id: string, public name: string) {
        if (!id) {
            throw new Error("Parameter id is required");
        }

        if (!name) {
            throw new Error("Parameter name is required");
        }

        this.role = new Role("guest");
    }
}