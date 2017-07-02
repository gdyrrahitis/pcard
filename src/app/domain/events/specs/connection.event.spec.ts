import { ConnectionEvent } from "../connection.event";

describe("Events", () => {
    describe("ConnectionEvent", () => {
        it("should have 'connection' event as name", () => {
            expect(ConnectionEvent.eventName).toBe("connection");
        });
    });
});