export class Card {
    private _users: string[] = [];
    constructor(private _name: string) { }

    public get users(): string[] {
        return this._users;
    }

    public get name(): string {
        return this._name;
    }

    public with(id: string) {
        if (!id) {
            throw new Error("Parameter id is required");
        }

        if (this.findUser(id)) {
            throw new Error("User id is already associated with card");
        }

        this._users.push(id);
    }

    private findUser(id: string) {
        return this._users.filter(u => u === id)[0];
    }

    public from(id: string) {
        if (!id) {
            throw new Error("Parameter id is required");
        }

        if (this.findUser(id)) {
            let index = this._users.findIndex(u => u === id);

            if(index !== -1) {
                this._users.splice(index, 1);
            }
        } else {
            throw new Error(`User with id '${id}' is not associated with card '${this._name}'`);
        }
    }

    public clean() {
        this._users.splice(0, this._users.length);
    }
}