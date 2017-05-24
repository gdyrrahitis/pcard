import { BaseController } from "./base.controller";

describe("Base controller spec", () => {
    let $scope;

    beforeEach(() => {
        $scope = {};
    });

    it("Should create a new instance", () => {
        // arrange | act
        let controller = new BaseController($scope);

        // assert
        expect(controller).toBeDefined();
    });

    it("Should have controllerId as the input of setUniqueId", () => {
        // arrange
        let input = "myUniqueId";
        let controller = new BaseController($scope);

        // act
        controller.setUniqueId(input);

        // assert
        expect($scope.controllerId).toBe(input);
    });
});