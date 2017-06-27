import { User, Moderator, Guest, UserRole } from "./user";
import { Deck } from "./deck";
import { Card } from "./card";

export class Room {
    private _users: UserRole[] = [];
    private _deck: Deck;
    private _lock: boolean;

    constructor(public id: string) {
        if (!id) {
            throw new Error("Parameter id is required");
        }

        this._deck = new Deck();
    }

    public get lock(): boolean {
        return this._lock;
    };

    public get deck(): Deck {
        return this._deck;
    }

    public get users(): UserRole[] {
        return JSON.parse(JSON.stringify(this._users));
    }

    public getUser(id: string): UserRole {
        return this._users.filter(u => u.id == id)[0];
    }

    public addUser(user: User) {
        if (this.getUser(user.id)) {
            throw new Error("Cannot add user with same id");
        }

        if (this.lock) {
            throw new Error("Room is locked. Users are not permitted to enter while in planning session.");
        }

        this._users.push(this.IsAnyUser() ?
            new Guest(user.id, user.name) :
            new Moderator(user.id, user.name));
    }

    private IsAnyUser(): boolean {
        return this._users.length !== 0;
    }

    public removeUser(id: string) {
        let index = this._users.findIndex(u => u.id === id);
        if (index !== -1) {
            this._users.splice(index, 1);
        }
    }

    public associate(id: string): (name: string) => void {
        if (!this.getUser(id)) {
            throw new Error(`User with id '${id}' does not exist`);
        }

        if (this._deck.lock) {
            return (name) => { };
        }

        return (name) => {
            this._deck.getCard(name).with(id);
        };
    }

    public disassociate(id: string): (name: string) => void {
        if (!this.getUser(id)) {
            throw new Error(`User with id '${id}' does not exist`);
        }
        
        if (this._deck.lock) {
            return (name) => { };
        }

        return (name) => {
            this._deck.getCard(name).from(id);
        };
    }

    public setLock(condition: boolean) {
        this._lock = condition;
    }
}