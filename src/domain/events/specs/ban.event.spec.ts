import { BanEvent } from "../ban.event";

describe("Events", () => {
    describe("BanEvent", () => {
        it("should have 'ban' event as name", () => {
            expect(BanEvent.eventName).toBe("ban");
        });
    });
});