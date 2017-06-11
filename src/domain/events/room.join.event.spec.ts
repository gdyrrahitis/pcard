import { RoomJoinEvent } from "./room.join.event";

describe("Events", () => {
    describe("RoomJoinEvent", () => {
        it("should have 'room-join' event as name", () => {
            expect(RoomJoinEvent.eventName).toBe("room-join");
        });

        it("should initialize event data", () => {
            // arrange
            let data = { name: "George", roomId: "1234" };

            // act
            let event = new RoomJoinEvent(data);

            // assert
            expect(event.data.name).toBe("George");
            expect(event.data.roomId).toBe("1234");
        });
    });
});