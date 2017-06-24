import { RoomNotFoundEvent } from "../room.not.found.event";

describe("Events", () => {
    describe("RoomNotFoundEvent", () => {
        it("should have 'room-not-found' event as name", () => {
            expect(RoomNotFoundEvent.eventName).toBe("room-not-found");
        });
    });
});