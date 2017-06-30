import { add, gtThan } from "../index";

describe("Functional operations spec", () => {
    it("should add two numbers when calling add", () => {
        // arrange
        let x = 15, y = 12;

        // act
        let result = add(x)(y);

        // assert
        expect(result).toBe(27);
    });

    it("should return true for x > y when calling gtThan", () => {
        // arrange
        let x = 10, y = 20;

        // act
        let falsyResult = gtThan(y)(x);
        let truthyResult = gtThan(x)(y);

        // assert
        expect(falsyResult).toBeFalsy();
        expect(truthyResult).toBeTruthy();
    });
});