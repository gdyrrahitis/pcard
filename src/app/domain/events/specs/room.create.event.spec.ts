import { RoomCreateEvent } from "../room.create.event";

describe("Events", () => {
    describe("RoomCreateEvent", () => {
        it("should have 'room-create' event as name", () => {
            expect(RoomCreateEvent.eventName).toBe("room-create");
        });

        it("should initialize event data", () => {
            // arrange
            let data = { name: "George" };
            
            // act
            let event = new RoomCreateEvent(data);

            // assert
            expect(event.data.name).toBe(data.name);
        });
    });
});