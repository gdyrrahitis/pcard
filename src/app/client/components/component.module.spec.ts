import * as angular from "angular";

import { ComponentModule } from "./component.module";

describe("Modules", () => {
    describe("Component", () => {
        let createComponent: (name: string, locals: any, bindings: any) => IFooterComponent;

        beforeEach(angular.mock.module(ComponentModule));
        beforeEach(inject((_$componentController_) => {
            createComponent = (name: string, locals: any, bindings: any) => _$componentController_(name, locals, bindings);
        }));

        it("should resolve home component", () => {
            let component = createComponent("pcardHome", null, {});
            expect(component).toBeDefined();
        });

        it("should resolve modal component", () => {
            let component = createComponent("pcardModal", null, {});
            expect(component).toBeDefined();
        });
    });
});