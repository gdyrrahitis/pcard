import { Card } from "./card";

describe("Model", () => {
    describe("Card", () => {
        describe("with", () => {
            it("should throw an error for empty id", () => {
                // arrange | act
                let card = new Card("one");

                // assert
                expect(() => card.with("")).toThrowError("Parameter id is required");
            });

            it("should throw an error for null id", () => {
                // arrange | act
                let card = new Card("one");

                // assert
                expect(() => card.with(null)).toThrowError("Parameter id is required");
            });

            it("it should associate with user id", () => {
                // arrange | act
                let card = new Card("one");

                // act
                card.with("user1");

                // assert
                expect(card.users.length).toBe(1);
                expect(card.users[0]).toBe("user1");
            });

            it("it should throw an error for already associated id", () => {
                // arrange | act
                let card = new Card("one");
                card.with("user1");

                // act | assert
                expect(() => card.with("user1")).toThrowError("User id is already associated with card");
            });
        });

        describe("from", () => {
            it("should throw an error for empty id", () => {
                // arrange | act
                let card = new Card("one");

                // assert
                expect(() => card.from("")).toThrowError("Parameter id is required");
            });

            it("should throw an error for null id", () => {
                // arrange | act
                let card = new Card("one");

                // assert
                expect(() => card.from(null)).toThrowError("Parameter id is required");
            });

            it("it should disassociate from user with id", () => {
                // arrange | act
                let card = new Card("one");
                card.with("user1");

                // act
                card.from("user1");

                // assert
                expect(card.users.length).toBe(0);
            });

            it("it should throw an error for trying to disassociate non-existent user", () => {
                // arrange
                let card = new Card("one");
                card.with("user1");

                // act | assert
                expect(() => card.from("user2")).toThrowError("User with id 'user2' is not associated with card 'one'");
            });
        });

        describe("clean", () => {
            it("it clean all users from list", () => {
                // arrange | act
                let card = new Card("one");
                card.with("user1");
                card.with("user2");
                
                // act
                card.clean();

                // assert
                expect(card.users.length).toBe(0);
            });
        });
    });
});