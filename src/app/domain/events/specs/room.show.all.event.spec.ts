import { UserRole } from "../../index";
import { RoomShowAllEvent } from "../room.show.all.event";

describe("Events", () => {
    describe("RoomShowAllEvent", () => {
        it("should have 'room-show-all' event as name", () => {
            expect(RoomShowAllEvent.eventName).toBe("room-show-all");
        });

        it("should initialize users count", () => {
            // arrange
            let users: UserRole[] = [{
                id: "id1",
                name: "George",
                role: { name: "guest" }
            }];

            // act
            let event = new RoomShowAllEvent(users);

            // assert
            expect(event.users.length).toBe(1);
            expect(event.users[0].id).toBe("id1");
            expect(event.users[0].name).toBe("George");
            expect(event.users[0].role.name).toBe("guest");
        });
    });
});