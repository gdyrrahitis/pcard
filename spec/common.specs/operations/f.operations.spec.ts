import { add, gtThan } from "../../../common/index";

describe("Functional operations spec", () => {
    it("should add two numbers when calling add", () => {
        // Arrange
        let x = 15, y = 12;
        
        // Act
        let result = add(x)(y);

        // Assert
        expect(result).toBe(27);
    });

    it("should return true for x > y when calling gtThan", () => {
        // Arrange
        let x = 10, y = 20;

        // Act
        let falsyResult = gtThan(y)(x);
        let truthyResult = gtThan(x)(y);

        // Assert
        expect(falsyResult).toBeFalsy();
        expect(truthyResult).toBeTruthy();
    });
});