import { compose, add } from "../index";

describe("Functional transforms spec", () => {
    it("should compose f(g(x)) returning f type result when calling compose", () => {
        // arrange
        let num = 20;

        // act
        let result = compose(add(5), add(10))(num);

        // assert
        expect(result).toBe(35);
    });
});