import * as angular from "angular";

import { SidebarComponent } from "./sidebar.component";
import { SidebarModule } from "./sidebar.module";

describe("Sidebar", () => {
    let createComponent: (name: string, locals: any, bindings: any) => any;

    beforeEach(angular.mock.module(SidebarModule));
    beforeEach(inject((_$componentController_) => {
        createComponent = (name: string, locals: any, bindings: any) => _$componentController_(name, locals, bindings);
    }));

    describe("Component", () => { 
        let $compile: ng.ICompileService;
        let $rootScope: ng.IRootScopeService;

        beforeEach(inject((_$compile_, _$rootScope_) => {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
        }));

        xit("should define a template", () => {
            // arrange
            let element = angular.element("<pcard-sidebar></pcard-sidebar>");

            // act
            let template = $compile(element)($rootScope);

            // assert
            expect(template).toBeDefined();
            expect(template.html()).toBeDefined();
            expect(template.html()).not.toBeNull();
            expect(template.html() === "").not.toBeTruthy("Expected html to have a body");
        });
    });

    describe("Module", () => {
        it("should resolve sidebar component", () => {
            let component = createComponent("pcardSidebar", null, {});
            expect(component).toBeDefined();
        });
    });
});