import * as angular from "angular";

import { HeaderModule } from "./header.module";
import { HeaderComponent } from "./header.component";

describe("Header", () => {
    let createComponent: (name: string, locals: any, bindings: any) => any;
    let $compile: ng.ICompileService;
    let $rootScope: ng.IRootScopeService;

    beforeEach(angular.mock.module(HeaderModule));
    beforeEach(angular.mock.module("./menu.html"));
    beforeEach(angular.mock.module("./header.html"));
    beforeEach(inject((_$componentController_, _$compile_: ng.ICompileService, _$rootScope_: ng.IRootScopeService) => {
        createComponent = (name: string, locals: any, bindings: any) => _$componentController_(name, locals, bindings);
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    describe("Component", () => {
        it("should contain menu component as child", () => {
            // arrange
            let element = angular.element("<pcard-header></pcard-header>");
            let template = $compile(element)($rootScope);
            $rootScope.$digest();

            let result = template.find("pcard-menu");

            expect(result.html() !== "").toBeTruthy();
            expect(result.find("nav").html() !== "").toBeTruthy();
        });
    });

    describe("Module", () => {
        it("should resolve header component", () => {
            let component = createComponent("pcardHeader", null, {});
            expect(component).toBeDefined();
        });

        it("should resolve menu component", () => {
            let component = createComponent("pcardMenu", null, {});
            expect(component).toBeDefined();
        });
    });
});