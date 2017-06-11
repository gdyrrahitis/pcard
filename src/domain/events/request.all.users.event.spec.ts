import { RequestAllUsersEvent } from "./request.all.users.event";

describe("Events", () => {
    describe("RequestAllUsersEvent", () => {
        it("should have 'request-all-users' event as name", () => {
            expect(RequestAllUsersEvent.eventName).toBe("request-all-users");
        });
    });
});