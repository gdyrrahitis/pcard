import { RoomLeaveEvent } from "../room.leave.event";

describe("Events", () => {
    describe("RoomLeaveEvent", () => {
        it("should have 'room-leave' event as name", () => {
            expect(RoomLeaveEvent.eventName).toBe("room-leave");
        });
    });
});