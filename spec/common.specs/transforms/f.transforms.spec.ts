import { compose, gtThan, add } from "../../../common/index";

describe("Functional transforms spec", () => {
    it("should compose f(g(x)) returning f type result when calling compose", () => {
        // Arrange
        let num = 20;

        // Act
        let result = compose(add(5), add(10))(num);

        // Assert
        expect(result).toBe(35);
    });
});