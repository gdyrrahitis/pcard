import { Deck } from "../deck";

describe("Model", () => {
    describe("Deck", () => {
        describe("getCard", () => {
            it("should throw error for non-existend card", () => {
                // arrange
                let deck = new Deck();

                // act | assert
                expect(() => deck.getCard("fake")).toThrowError("Card 'fake' does not exist");
            });

            it("should return card", () => {
                // arrange
                let deck = new Deck();

                // act
                let result = deck.getCard("one");

                // assert
                expect(result.name).toBe("one");
            });
        });

        describe("reset", () => {
            it("should reset all users for each card to none", () => {
                // arrange
                let deck = new Deck();
                let cards = deck.cards;
                cards.forEach((c, i) => c.with(`user${i}`));

                // act
                deck.reset();

                // assert
                for (let i = 0; i < cards.length; i++) {
                    expect(cards[i].users.length).toBe(0);
                }
            });
        });

        describe("toggleLock", () => {
            it("should be unlocked by default", () => {
                // arrange
                let deck = new Deck();

                // act | assert
                expect(deck.lock).toBeFalsy();
            });

            it("should set deck to locked", () => {
                // arrange
                let deck = new Deck();

                // act
                deck.setLocked(true);

                // assert
                expect(deck.lock).toBeTruthy();
            });

            it("should set deck to unlocked", () => {
                // arrange
                let deck = new Deck();
                deck.setLocked(true);

                // act
                deck.setLocked(false);

                // assert
                expect(deck.lock).toBeFalsy();
            });
        });
    });
});