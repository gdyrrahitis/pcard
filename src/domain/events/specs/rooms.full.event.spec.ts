import { RoomsFullEvent } from "../rooms.full.event";

describe("Events", () => {
    describe("RoomsFullEvent", () => {
        it("should have 'rooms-full' event as name", () => {
            expect(RoomsFullEvent.eventName).toBe("rooms-full");
        });
    });
});