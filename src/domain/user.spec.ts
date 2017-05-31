import { Guest, Moderator } from "./user";
import { Role } from "./role";

describe("Model", () => {
    describe("User", () => {
        describe("Moderator", () => {
            it("should throw error if id is empty", () => {
                expect(() => new Moderator("", "George")).toThrowError("Parameter id is required");
            });

            it("should throw error if id is null", () => {
                expect(() => new Moderator(null, "George")).toThrowError("Parameter id is required");
            });

            it("should throw error if name is empty", () => {
                expect(() => new Moderator("1234", "")).toThrowError("Parameter name is required");
            });

            it("should throw error if name is null", () => {
                expect(() => new Moderator("1234", null)).toThrowError("Parameter name is required");
            });

            it("should set id and name successfully", () => {
                // arrange
                let user = new Moderator("1234", "George");

                // assert
                expect(user.id).toBe("1234");
                expect(user.name).toBe("George");
            });

            it("should have moderator role", () => {
                // arrange
                let user = new Moderator("1234", "George");

                // assert
                expect(user.role.name).toBe("moderator");
            });
        });

        describe("Guest", () => {
            it("should throw error if id is empty", () => {
                expect(() => new Guest("", "George")).toThrowError("Parameter id is required");
            });

            it("should throw error if id is null", () => {
                expect(() => new Guest(null, "George")).toThrowError("Parameter id is required");
            });

            it("should throw error if name is empty", () => {
                expect(() => new Guest("1234", "")).toThrowError("Parameter name is required");
            });

            it("should throw error if name is null", () => {
                expect(() => new Guest("1234", null)).toThrowError("Parameter name is required");
            });

            it("should set id and name successfully", () => {
                // arrange
                let user = new Guest("1234", "George");

                // assert
                expect(user.id).toBe("1234");
                expect(user.name).toBe("George");
            });

            it("should have guest role", () => {
                // arrange
                let user = new Guest("1234", "George");

                // assert
                expect(user.role.name).toBe("guest");
            });
        });
    });
});