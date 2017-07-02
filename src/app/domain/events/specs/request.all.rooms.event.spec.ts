import { RequestAllRoomsEvent } from "../request.all.rooms.event";

describe("Events", () => {
    describe("RequestAllRoomsEvent", () => {
        it("should have 'request-all-rooms' event as name", () => {
            expect(RequestAllRoomsEvent.eventName).toBe("request-all-rooms");
        });
    });
});