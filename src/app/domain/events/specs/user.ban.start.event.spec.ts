import { UserBanStart } from "../user.ban.start.event";

describe("Events", () => {
    describe("UserBanStart", () => {
        it("should have 'user-ban-start' event as name", () => {
            expect(UserBanStart.eventName).toBe("user-ban-start");
        });
    });
});