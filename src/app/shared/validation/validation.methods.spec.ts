import { isUndefined } from "./validation.methods";

describe("Shared", () => {
    describe("isUndefined", () => {
        it("should throw for undefined object", () => {
            expect(isUndefined(undefined)).toBeTruthy();
        });

        it("should throw for empty object", () => {
            expect(isUndefined({})).toBeTruthy();
        });

        it("should throw for null object", () => {
            expect(isUndefined(null)).toBeTruthy();
        });

        it("should not throw for valid object", () => {
            expect(isUndefined({ name: "George" })).toBeFalsy();
        });
    });
})