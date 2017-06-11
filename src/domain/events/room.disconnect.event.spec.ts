import { RoomDisconnectEvent } from "./room.disconnect.event";

describe("Events", () => {
    describe("RoomDisconnectEvent", () => {
        it("should have 'room-disconnect' event as name", () => {
            expect(RoomDisconnectEvent.eventName).toBe("room-disconnect");
        });

        it("should initialize event data", () => {
            // arrange
            let data = { userId: "user1", roomId: "1234" };

            // act
            let event = new RoomDisconnectEvent(data);

            // assert
            expect(event.data.userId).toBe(data.userId);
            expect(event.data.roomId).toBe(data.roomId);
        });
    });
});