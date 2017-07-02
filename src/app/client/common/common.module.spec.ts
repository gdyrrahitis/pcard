import * as angular from "angular";

import { CommonModule } from "./common.module";

describe("Modules", () => {
    describe("Common", () => {
        let createComponent: (name: string, locals: any, bindings: any) => IFooterComponent;

        beforeEach(angular.mock.module(CommonModule));
        beforeEach(inject((_$componentController_) => {
            createComponent = (name: string, locals: any, bindings: any) => _$componentController_(name, locals, bindings);
        }));

        it("should resolve footer component", () => {
            let component = createComponent("pcardFooter", null, {});
            expect(component).toBeDefined();
        });

        it("should resolve menu component", () => {
            let component = createComponent("pcardMenu", null, {});
            expect(component).toBeDefined();
        });
    });
});