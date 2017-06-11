import { ModalJoinResultEvent } from "./modal.join.result.event";

describe("Events", () => {
    describe("ModalJoinResultEvent", () => {
        it("should have 'modal-join-result' event as name", () => {
            expect(ModalJoinResultEvent.eventName).toBe("modal-join-result");
        });

        it("should initialize event result", () => {
            // arrange
            let result = "cancel";
            
            // act
            let event = new ModalJoinResultEvent(result);

            // assert
            expect(event.result).toBe(result);
        });
    });
});