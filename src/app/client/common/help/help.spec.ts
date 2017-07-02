import * as angular from "angular";

import { HelpModule, HelpComponent } from "./index";

declare type Locals = { $scope?: ng.IScope, [key: string]: any };
declare type ComponentControllerArgs = <T, TBinding>(componentName: string,
    locals: { $scope?: ng.IScope, [key: string]: any },
    bindings?: TBinding, ident?: string) => T;
describe("Help", () => {
    let createComponent: ComponentControllerArgs;
    let $state: ng.ui.IStateService;
    let $rootScope: ng.IRootScopeService;
    let $location: ng.ILocationService;
    let state: string = "help";

    beforeEach(angular.mock.module(HelpModule));
    beforeEach(angular.mock.module(HelpModule, ($stateProvider: ng.ui.IStateProvider) => {
        $stateProvider.state("home", { url: "/" });
    }));
    beforeEach(inject((_$componentController_: ng.IComponentControllerService, _$state_: ng.ui.IStateService,
        _$rootScope_: ng.IRootScopeService, _$location_: ng.ILocationService) => {
        $state = _$state_;
        $rootScope = _$rootScope_;
        $location = _$location_;
        createComponent = (name: string, locals: Locals, bindings: {}) => _$componentController_(name, locals, bindings);
    }));

    describe("Component", () => {
        it("should be routed component", () => {
            // act
            $state.go(state);
            $rootScope.$digest();

            // assert
            expect($state.current.component).toBe("help", "Component is not set");
            expect($state.current.name).toBe(state, "State is not set");
            expect($state.current.url).toBe("/help");
        });

        it("should redirect to home if route is wrong", () => {
            // act
            $state.go("non-existent");
            $rootScope.$digest();

            // assert
            expect($state.current.url).toBe("/");
        });
    });

    describe("Module", () => {
        it("should have a help component", () => {
            let helpComponent = createComponent("help", null, {});
            expect(helpComponent).toBeDefined();
        });
    });
});