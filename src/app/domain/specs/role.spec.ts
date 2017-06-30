import { Role } from "../role";

describe("Model", () => {
    describe("Role", () => {
        it("should throw an Error when role is empty", () => {
            expect(() => new Role("")).toThrowError("Parameter name is required");
        });

        it("should throw an Error when role is null", () => {
            expect(() => new Role(null)).toThrowError("Parameter name is required");
        });

        it("should successfully create a role object", () => {
            // arrange | act
            let role = new Role("moderator");

            // assert
            expect(role.name).toBe("moderator");
        });
    });
});