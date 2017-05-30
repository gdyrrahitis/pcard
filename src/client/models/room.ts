import { User, Moderator, Guest, UserRole } from "./user";
import { Deck } from "./deck";
import { Card } from "./card";

export class Room {
    private users: UserRole[] = [];
    private _deck: Deck;
    constructor(public id: string) {
        if (!id) {
            throw new Error("Parameter id is required");
        }

        this._deck = new Deck();
    }

    public get deck(): Deck {
        return this._deck;
    }

    public getUser(id: string): UserRole {
        return this.users.filter(u => u.id == id)[0];
    }

    public addUser(user: User) {
        if (this.getUser(user.id)) {
            throw new Error("Cannot add user with same id");
        }

        this.users.push(this.IsAnyUser() ?
            new Guest(user.id, user.name) :
            new Moderator(user.id, user.name));
    }

    private IsAnyUser(): boolean {
        return this.users.length !== 0;
    }

    public removeUser(id: string) {
        let index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.users.splice(index, 1);
        }
    }

    public associate(id: string): (name: string) => void {
        if (!this.getUser(id)) {
            throw new Error(`User with id '${id}' does not exist`);
        }

        return (name) => {
            this._deck.getCard(name).with(id);
        };
    }

    public disassociate(id: string): (name: string) => void {
        if (!this.getUser(id)) {
            throw new Error(`User with id '${id}' does not exist`);
        }

        return (name) => {
            this._deck.getCard(name).from(id);
        };
    }
}