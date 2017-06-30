import { UserBannedEvent } from "../user.banned.event";

describe("Events", () => {
    describe("UserBannedEvent", () => {
        it("should have 'user-banned' event as name", () => {
            expect(UserBannedEvent.eventName).toBe("user-banned");
        });
    });
});