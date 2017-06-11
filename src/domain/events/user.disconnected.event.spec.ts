import { UserDisconnectedEvent } from "./user.disconnected.event";

describe("Events", () => {
    describe("UserDisconnectedEvent", () => {
        it("should have 'user-disconnected' event as name", () => {
            expect(UserDisconnectedEvent.eventName).toBe("user-disconnected");
        });

        it("should initialize room id", () => {
            // arrange
            let roomId = "1234";

            // act
            let event = new UserDisconnectedEvent(roomId);

            // assert
            expect(event.roomId).toBe(roomId);
        });
    });
});