import { BaseController } from "../../src/base.controller/base.controller";

describe("Base controller spec", () => {
    let $scope;

    beforeEach(() => {
        $scope = {};
    });

    it("Should create a new instance", () => {
        // Arrange | Act
        let controller = new BaseController($scope);

        // Assert
        expect(controller).toBeDefined();
    });

    it("Should have controllerId as the input of setUniqueId", () => {
        // Arrange
        let input = "myUniqueId";
        let controller = new BaseController($scope);

        // Act
        controller.setUniqueId(input);

        // Assert
        expect($scope.controllerId).toBe(input);
    });
});