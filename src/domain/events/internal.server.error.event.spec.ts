import { InternalServerErrorEvent } from "./internal.server.error.event";

describe("Events", () => {
    describe("InternalServerErrorEvent", () => {
        it("should have 'internal-server-error' event as name", () => {
            expect(InternalServerErrorEvent.eventName).toBe("internal-server-error");
        });

        it("should initialize error object", () => {
            // arrange
            let message = "Unhandled error";

            // act
            let event = new InternalServerErrorEvent({ message: message });

            // assert
            expect(event.error).toBeDefined();
            expect(event.error.message).toBe(message);
        });
    });
});