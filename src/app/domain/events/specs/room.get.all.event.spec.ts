import { RoomGetAllEvent } from "../room.get.all.event";

describe("Events", () => {
    describe("RoomGetAllEvent", () => {
        it("should have 'room-get-all' event as name", () => {
            expect(RoomGetAllEvent.eventName).toBe("room-get-all");
        });

        it("should initialize event data", () => {
            // arrange
            let data = { roomId: "1234" };

            // act
            let event = new RoomGetAllEvent(data);

            // assert
            expect(event.data.roomId).toBe(data.roomId);
        });
    });
});