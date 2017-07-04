import * as angular from "angular";
import { ModalComponent } from "./modal.component";
import { ModalModule } from "./modal.module";

describe("Modal", () => {
    let createComponent: (name: string, locals: { [key: string]: any, $scope?: ng.IScope }, bindings: any) => IModalComponent;
    let bindings = { resolve: "<", close: "&", dismiss: "&" };

    beforeEach(angular.mock.module(ModalModule));
    beforeEach(angular.mock.module("./modal.html"));
    beforeEach(inject((_$componentController_: ng.IComponentControllerService) => {
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
    });

    describe("Module", () => {
        it("should resolve modal component", () => {
            let component = createComponent("pcardModal", null, bindings);
            expect(component).toBeDefined();
        });
    });
});