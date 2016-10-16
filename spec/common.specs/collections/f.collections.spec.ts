import { getFirst, filter, gtThan, filterProp, findIndex, reducer, removeFromIndexNumberOfItems } from "../../../common/index";

describe("Functional collections spec", () => {
    it("should return first item in collection when calling getFirst", () => {
        // Arrange
        let collection = [5, 4, 87, 74];
        let anotherCollection = ["feawf", "feawefwty", "tr5ewt"];

        // Act
        let result = getFirst(collection);
        let anotherResult = getFirst(anotherCollection);

        // Assert
        expect(result).toBe(5);
        expect(anotherResult).toBe("feawf");

    });

    it("should return a filtered array with all values greater than 100", () => {
        // Arrange
        let collection = [445, 8784, 841, 66, 14];

        // Act
        let result = filter(gtThan(100))(collection);

        // Assert
        expect(result.length).toBe(3);
        expect(result).toEqual([445, 8784, 841]);
    });

    it("should return a filtered array with all values equal to value", () => {
        // Arrange
        let collection = [
            { id: 1, room: 1, name: "george" },
            { id: 4, room: 1, name: "john" },
            { id: 7, room: 1, name: "jane" },
            { id: 2, room: 2, name: "jack" },
            { id: 3, room: 2, name: "peter" }
        ];
        let room = 1;

        // Act
        let result = filter(filterProp(room)("room"))(collection);

        // Assert
        expect(result.length).toBe(3);
        expect(result).toEqual([{ id: 1, room: 1, name: "george" }, { id: 4, room: 1, name: "john" }, { id: 7, room: 1, name: "jane" }]);
    });

    it("should find the index of the item in collection based on predicate", () => {
        // Arrange
        let id = 7;
        let collection = [
            { id: 1, room: 1, name: "george" },
            { id: 4, room: 1, name: "john" },
            { id: 7, room: 1, name: "jane" },
            { id: 2, room: 2, name: "jack" },
            { id: 3, room: 2, name: "peter" }
        ];

        // Act
        let result = findIndex(reducer("id")(7))(collection);

        // Assert
        expect(result).toBe(2);
    });

    it("should splice an array on the designated index", () => {
        // Arrange
        let id = 7;
        let collection = [
            { id: 1, room: 1, name: "george" },
            { id: 4, room: 1, name: "john" },
            { id: 7, room: 1, name: "jane" },
            { id: 2, room: 2, name: "jack" },
            { id: 3, room: 2, name: "peter" }
        ];

        // Act
        let result = removeFromIndexNumberOfItems(1, 2)(collection);

        // Assert
        expect(result.length).toBe(2);
        expect(result).toEqual([
            { id: 4, room: 1, name: "john" },
            { id: 7, room: 1, name: "jane" }
        ]);
        expect(collection.length).toBe(3);
        expect(collection).toEqual([
            { id: 1, room: 1, name: "george" },
            { id: 2, room: 2, name: "jack" },
            { id: 3, room: 2, name: "peter" }
        ]);
    });
});