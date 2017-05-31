export class Role {
    constructor(public name: string) {
        if (!name) {
            throw new Error("Parameter name is required");
        }
    }
}