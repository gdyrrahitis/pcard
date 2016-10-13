import { BaseController } from "../../src/base.controller/base.controller";

describe("Base controller spec", () => {
    var scope,
        controller;
    var x;
    beforeEach(angular.mock.module("app"));
    beforeEach(inject(function ($injector) {
        x = $injector;
    }));

    xit("Should create a new instance", () => {
        // Assert
        expect(controller).toBeDefined();
    });

    xit("Should have controllerId as the input of setUniqueId", () => {
        // Arrange
        let input = "myUniqueId";

        // Act
        controller.setUniqueId(input);

        // Assert
        expect(scope.controllerId).toBe(input);
    });
});