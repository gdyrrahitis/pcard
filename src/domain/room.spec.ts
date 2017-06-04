import { Room } from "./room";
import { User } from "./user";

describe("Model", () => {
    describe("Room", () => {
        let roomId = "1234";
        let mountainGoat = [
            "zero",
            "half",
            "one",
            "two",
            "three",
            "five",
            "eight",
            "thirteen",
            "twenty",
            "forty",
            "one-hundred",
            "coffee",
            "question"
        ];

        describe("constructor", () => {
            it("should create a room with an id and get that id from property", () => {
                // arrange |  act
                let room = new Room(roomId);

                // assert
                expect(room.id).toBe(roomId);
            });

            it("should throw an Error for empty id", () => {
                expect(() => new Room("")).toThrowError("Parameter id is required");
            });

            it("should throw an Error for null id", () => {
                expect(() => new Room(null)).toThrowError("Parameter id is required");
            });
        });

        describe("addUser", () => {
            it("should make the first user moderator", () => {
                // arrange
                let room = new Room(roomId);
                let user: User = { id: "user1", name: "George" };

                // act
                room.addUser(user);
                let registered = room.getUser("user1");

                // assert
                expect(registered.id).toBe("user1");
                expect(registered.name).toBe("George");
                expect(registered.role.name).toBe("moderator");
            });

            it("should make the user after first a guest", () => {
                // arrange
                let room = new Room(roomId);
                let moderator: User = { id: "user1", name: "George" };
                let guest: User = { id: "user2", name: "Chris" };
                room.addUser(moderator);

                // act
                room.addUser(guest);
                let registered = room.getUser("user2");

                // assert
                expect(registered.id).toBe("user2");
                expect(registered.name).toBe("Chris");
                expect(registered.role.name).toBe("guest");
            });

            it("should throw an error if user with the same id is added again", () => {
                // arrange
                let room = new Room(roomId);
                let user: User = { id: "user1", name: "George" };
                let userCopy: User = { id: "user1", name: "George" };
                room.addUser(user);

                // act | assert
                expect(() => room.addUser(userCopy)).toThrowError("Cannot add user with same id");
            });
        });

        describe("removeUser", () => {
            it("should just return without any error if users array is empty", () => {
                // arrange
                let room = new Room(roomId);

                // act
                room.removeUser("user1");

                // assert
                expect(true).toBeTruthy();
            });

            it("should remove user from list", () => {
                // arrange
                let room = new Room(roomId);
                let user: User = { id: "user1", name: "George" };
                room.addUser(user);

                // act
                room.removeUser(user.id);

                // assert
                expect(room.getUser(user.id)).toBeUndefined();
            });
        });

        describe("getUser", () => {
            it("should return undefined for non-existent user in empty list", () => {
                // arrange
                let room = new Room(roomId);

                // act
                let result = room.getUser("user1");

                // assert
                expect(result).toBeUndefined();
            });

            it("should return undefined for non-existent user in list", () => {
                // arrange
                let room = new Room(roomId);
                let user: User = { id: "user1", name: "George" };
                room.addUser(user);

                // act
                let result = room.getUser("user2");

                // assert
                expect(result).toBeUndefined();
            });

            it("should return user that exists", () => {
                // arrange
                let room = new Room(roomId);
                let user: User = { id: "user1", name: "George" };
                room.addUser(user);

                // act
                let result = room.getUser("user1");

                // assert
                expect(result.id).toBe("user1");
                expect(result.name).toBe("George");
                expect(result.role.name).toBe("moderator");
            });
        });

        describe("deck", () => {
            it("should get mountain goat deck", () => {
                // arrange
                let room = new Room(roomId);

                // act
                let result = room.deck;

                // assert
                for (let i = 0; i < result.cards.length; i++) {
                    expect(result.cards[i].name).toBe(mountainGoat[i]);
                }
            });
        });

        describe("associate", () => {
            it("should associate user with card", () => {
                // arrange
                let room = new Room(roomId);
                let user: User = { id: "user1", name: "George" };
                room.addUser(user);

                // act
                room.associate(user.id)("one");
                let card = room.deck.getCard("one");

                // assert
                expect(card.users.length).toBe(1);
                expect(card.users[0]).toBe(user.id);
            });

            it("should throw an error for trying to associate non-existent user", () => {
                // arrange
                let room = new Room(roomId);
                let user: User = { id: "user1", name: "George" };
                room.addUser(user);

                // act | assert
                expect(() => room.associate("user2")("one")).toThrowError("User with id 'user2' does not exist");
            });

            it("should throw an error for trying to associate non-existent card", () => {
                // arrange
                let room = new Room(roomId);
                let user: User = { id: "user1", name: "George" };
                room.addUser(user);

                // act | assert
                expect(() => room.associate(user.id)("fake")).toThrowError("Card 'fake' does not exist");
            });
        });

        describe("disassociate", () => {
            it("should disassociate user with card", () => {
                // arrange
                let room = new Room(roomId);
                let user: User = { id: "user1", name: "George" };
                room.addUser(user);
                room.associate(user.id)("one");

                // act
                room.disassociate(user.id)("one");
                let card = room.deck.getCard("one");

                // assert
                expect(card.users.length).toBe(0);
            });

            it("should throw an error for trying to disassociate non-existent user", () => {
                // arrange
                let room = new Room(roomId);
                let user: User = { id: "user1", name: "George" };
                room.addUser(user);

                // act | assert
                expect(() => room.disassociate("user2")("one")).toThrowError("User with id 'user2' does not exist");
            });

            it("should throw an error for trying to disassociate non-existent card", () => {
                // arrange
                let room = new Room(roomId);
                let user: User = { id: "user1", name: "George" };
                room.addUser(user);

                // act | assert
                expect(() => room.disassociate(user.id)("fake")).toThrowError("Card 'fake' does not exist");
            });
        });

        describe("users", () => {
            it("should get a copy of users array", () => {
                // arrange
                let room = new Room(roomId);
                let user1: User = { id: "user1", name: "George" };
                let user2: User = { id: "user2", name: "John" };
                room.addUser(user1);
                room.addUser(user2);

                // act
                let result = room.users;

                // assert
                expect(result.length).toBe(2);
                expect(result[0].id).toBe("user1");
                expect(result[0].name).toBe("George");
                expect(result[1].id).toBe("user2");
                expect(result[1].name).toBe("John");
            });

            it("should array be a copy object", () => {
                // arrange
                let room = new Room(roomId);
                let user1: User = { id: "user1", name: "George" };
                let user2: User = { id: "user2", name: "John" };
                room.addUser(user1);
                room.addUser(user2);

                // act
                let result = room.users;
                result[0].id = "user3";
                let array = room.users;
            
                // assert
                expect(result.length).toBe(2);
                expect(result[0].id).toBe("user3");
                expect(result[0].name).toBe("George");
                expect(result[1].id).toBe("user2");
                expect(result[1].name).toBe("John");
                expect(array[0].id).toBe("user1");
            });
        });
    });
});