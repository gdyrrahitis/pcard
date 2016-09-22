import { BaseController } from "../../src/base.controller/base.controller";

describe("Base controller spec", () => {
    var scope,
        controller;
    var x;
    beforeEach(angular.mock.module("app"));
    beforeEach(inject(function ($injector) {
        x = $injector;
    }));

    it("Should create a new instance", () => {
console.log(x)
        // Assert
        expect(controller).toBeDefined();
    });

    it("Should have controllerId as the input of setUniqueId", () => {
        // Arrange
        let input = "myUniqueId";

        // Act
        controller.setUniqueId(input);

        // Assert
        expect(scope.controllerId).toBe(input);
    });
});