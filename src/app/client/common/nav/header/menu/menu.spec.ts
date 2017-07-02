import * as angular from "angular";

import { MenuModule } from "./menu.module";
import { MenuComponent } from "./menu.component";


describe("Menu", () => {
    let createComponent: (name: string, locals: any, bindings: any) => IMenuComponent;
    let $location: ng.ILocationService;
    let $compile: ng.ICompileService;
    let $state: ng.ui.IStateService;
    let $rootScope: ng.IRootScopeService;

    beforeEach(angular.mock.module(MenuModule));
    beforeEach(angular.mock.module("./menu.html"));
    beforeEach(angular.mock.module(MenuModule, ($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) => {
        $stateProvider.state("home", { url: "/" }).state("help", { url: "/help" });
        $urlRouterProvider.otherwise("/");
    }));

    beforeEach(inject((_$componentController_: ng.IComponentControllerService,
        _$location_: ng.ILocationService, _$compile_: ng.ICompileService,
        _$state_: ng.ui.IStateService, _$rootScope_: ng.IRootScopeService) => {
        createComponent = (name: string, locals: any, bindings: any) => <IMenuComponent>_$componentController_(name, locals, bindings);
        $location = _$location_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $state = _$state_;
    }));

    describe("Component", () => {
        describe("navigateToHome", () => {
            it("should redirect to home", () => {
                // arrange
                let component = createComponent("pcardMenu", null, {});
                spyOn($location, "path");

                // act
                component.navigateToHome();

                // assert
                expect($location.path).toHaveBeenCalledWith("/");
            });

            it("should redirect to home by clicking on menu item", () => {
                // arrange
                let element = angular.element("<pcard-menu></pcard-menu>");
                let template = $compile(element)($rootScope);
                $rootScope.$digest();
                let menuItem = angular.element(template[0].querySelector("a.anchor-home"));

                // act
                menuItem.triggerHandler("click");

                // assert
                expect($state.current.name).toBe("home");
                expect($state.current.url).toBe("/");
            });
        });

        describe("navigateToHelp", () => {
            it("should redirect to help", () => {
                // arrange
                let component = createComponent("pcardMenu", null, {});
                spyOn($location, "path");

                // act
                component.navigateToHelp();

                // assert
                expect($location.path).toHaveBeenCalledWith("/help");
            });

            it("should redirect to help by clicking on menu item", () => {
                // arrange
                let element = angular.element("<pcard-menu></pcard-menu>");
                let template = $compile(element)($rootScope);
                $rootScope.$digest();
                let menuItem = angular.element(template[0].querySelector("a.anchor-help"));

                // act
                menuItem.triggerHandler("click");

                // assert
                expect($state.current.name).toBe("help");
                expect($state.current.url).toBe("/help");
            });
        });
    });

    describe("Module", () => {
        it("should resolve menu component", () => {
            let component = createComponent("pcardMenu", null, {});
            expect(component).toBeDefined();
        });
    });
});