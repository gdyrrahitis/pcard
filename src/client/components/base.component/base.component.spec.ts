import { BaseComponent } from "./base.component";

xdescribe("Base component spec", () => {
    let $scope;

    beforeEach(() => {
        $scope = {};
    });

    it("Should create a new instance", () => {
        // arrange | act
        let component = new BaseComponent($scope);

        // assert
        expect(component).toBeDefined();
    });

    it("Should have componentId as the input of setUniqueId", () => {
        // arrange
        let input = "myUniqueId";
        let component = new BaseComponent($scope);

        // act
        component.setUniqueId(input);

        // assert
        expect($scope.componentId).toBe(input);
    });
});