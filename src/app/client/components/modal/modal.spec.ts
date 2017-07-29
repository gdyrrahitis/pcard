import * as angular from "angular";
import { ModalComponent } from "./modal.component";
import { ModalModule } from "./modal.module";

describe("Modal", () => {
    let createComponent: (name: string, locals: { [key: string]: any, $scope?: ng.IScope }, bindings: any) => IModalComponent;
    let bindings = { resolve: "<", close: "&", dismiss: "&" };
    let scope: ng.IScope;
    let $compile: ng.ICompileService;

    beforeEach(angular.mock.module(ModalModule));
    beforeEach(angular.mock.module("./modal.html"));
    beforeEach(inject((_$componentController_: ng.IComponentControllerService, _$rootScope_: ng.IRootScopeService, _$compile_) => {
        scope = _$rootScope_.$new();
        $compile = _$compile_;
        createComponent = (name: string, locals: { [key: string]: any, $scope?: ng.IScope }, bindings: any) =>
            <IModalComponent>_$componentController_(name, locals, bindings);
    }));

    describe("Component", () => {
        describe("ok", () => {
            it("should call close method and send object with roomId", () => {
                // arrange
                let roomId: string = "1234";
                let component = createComponent("pcardModal", null, bindings);
                component.resolve = { roomId: roomId };
                component.$onInit();
                spyOn(<any>component, "close");

                // act
                component.ok();

                // assert
                expect((<any>component).close).toHaveBeenCalledWith({ roomId: roomId });
            });
        });

        describe("cancel", () => {
            it("should call dismiss method and send cancel string", () => {
                // arrange
                let component = createComponent("pcardModal", null, bindings);
                spyOn(<any>component, "dismiss");

                // act
                component.cancel();

                // assert
                expect((<any>component).dismiss).toHaveBeenCalledWith("cancel");
            });
        });

        describe("template", () => {
            it("should have go button disabled", () => {
                // arrange
                let element = angular.element("<pcard-modal></pcard-modal>");
                let template = $compile(element)(scope);
                scope.$digest();

                // act
                let button = angular.element(template[0].querySelector(".btn-primary"));

                // assert
                expect(button.prop("disabled")).toBeTruthy();
            });

            it("should have go button enabled when roomId is entered", () => {
                // arrange
                let element = angular.element("<pcard-modal></pcard-modal>");
                let template = $compile(element)(scope);
                scope.$digest();
                let input = angular.element(template.find("input"));

                // act
                input.val("1234").triggerHandler("input");
                scope.$apply();
                let button = angular.element(template[0].querySelector(".btn-primary"));

                // assert
                expect(input.hasClass("ng-valid")).toBeTruthy();
                expect(button.prop("disabled")).toBeFalsy();
            });

            it("should show 'Room id is required' error message when roomId is deleted and go button would be disabled", () => {
                // arrange
                let element = angular.element("<pcard-modal></pcard-modal>");
                let template = $compile(element)(scope);
                scope.$digest();
                let input = angular.element(template.find("input"));
                // act
                input.val("1234").triggerHandler("input");
                scope.$apply();
                input.val("").triggerHandler("input");
                scope.$apply();
                let button = angular.element(template[0].querySelector(".btn-primary"));
                let message = angular.element(template[0].querySelector(".help-block"));

                // assert
                expect(input.hasClass("ng-invalid")).toBeTruthy();
                expect(angular.element(template[0].querySelector(".form-group")).hasClass("has-error")).toBeTruthy();
                expect(message.hasClass("ng-hide")).toBeFalsy();
                expect(button.prop("disabled")).toBeTruthy();
            });
        });
    });

    describe("Module", () => {
        it("should resolve modal component", () => {
            let component = createComponent("pcardModal", null, bindings);
            expect(component).toBeDefined();
        });
    });
});