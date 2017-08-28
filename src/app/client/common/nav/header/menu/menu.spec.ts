import * as angular from "angular";

import { MenuModule } from "./menu.module";
import { MenuComponent } from "./menu.component";


describe("Menu", () => {
    let createComponent: (name: string, locals: any, bindings: any) => IMenuComponent;
    let $compile: ng.ICompileService;
    let $state: ng.ui.IStateService;
    let $rootScope: ng.IRootScopeService;
    let $timeout: ng.ITimeoutService;

    beforeEach(angular.mock.module(MenuModule));
    beforeEach(angular.mock.module("./menu.html"));
    beforeEach(angular.mock.module(MenuModule, ($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) => {
        $stateProvider.state("home", { url: "/home" })
            .state("help", { url: "/help" });
        $urlRouterProvider.when("/", "/home").otherwise("/home");
    }));

    beforeEach(inject((_$componentController_: ng.IComponentControllerService,
        _$compile_: ng.ICompileService, _$timeout_,
        _$state_: ng.ui.IStateService, _$rootScope_: ng.IRootScopeService) => {
        createComponent = (name: string, locals: any, bindings: any) => <IMenuComponent>_$componentController_(name, locals, bindings);
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $state = _$state_;
        $timeout = _$timeout_;
    }));

    describe("Component", () => {
        describe("navigateToHome", () => {
            it("should redirect to home by clicking on menu item", () => {
                // arrange
                let element = angular.element("<pcard-menu></pcard-menu>");
                let template = $compile(element)($rootScope);
                $rootScope.$digest();
                let menuItem = angular.element(template[0].querySelector("a.anchor-home"));

                // act
                menuItem.triggerHandler("click");
                $timeout.flush();
                $rootScope.$digest();

                // assert
                expect($state.current.name).toBe("home");
                expect($state.current.url).toBe("/home");
            });
        });

        describe("navigateToHelp", () => {
            it("should redirect to help by clicking on menu item", () => {
                // arrange
                let element = angular.element("<pcard-menu></pcard-menu>");
                let template = $compile(element)($rootScope);
                $rootScope.$digest();
                let menuItem = angular.element(template[0].querySelector("a.anchor-help"));

                // act
                menuItem.triggerHandler("click");
                $timeout.flush();
                $rootScope.$digest();

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