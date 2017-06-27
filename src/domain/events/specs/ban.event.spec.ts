import { BanEvent } from "../ban.event";

describe("Events", () => {
    describe("BanEvent", () => {
        it("should have 'ban' event as name", () => {
            expect(BanEvent.eventName).toBe("ban");
        });

        it("should initialize event data", () => {
            // arrange
            let data = { roomId: "1234", userId: "user1" };

            // act
            let event = new BanEvent(data);

            // assert
            expect(event.data.roomId).toBe("1234");
            expect(event.data.userId).toBe("user1");
        });
    });
});