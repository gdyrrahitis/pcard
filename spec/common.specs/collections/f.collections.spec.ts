import { getFirst, filter, gtThan } from "../../../common/index";

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

    it("should return a filtered array based on the predicate when calling filter", () => {
        // Arrange
        let collection = [445, 8784, 841, 66, 14];

        // Act
        let result = filter(gtThan(100))(collection);

        // Assert
        expect(result.length).toBe(3);
        expect(result).toEqual([445, 8784, 841]);
    });
});