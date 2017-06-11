import { RoomsAllEvent } from "./rooms.all.event";

describe("Events", () => {
    describe("RoomsAllEvent", () => {
        it("should have 'rooms-all' event as name", () => {
            expect(RoomsAllEvent.eventName).toBe("rooms-all");
        });

        it("should initialize rooms count", () => {
            // arrange
            let rooms = 100;

            // act
            let event = new RoomsAllEvent(rooms);

            // assert
            expect(event.rooms).toBe(rooms);
        });
    });
});