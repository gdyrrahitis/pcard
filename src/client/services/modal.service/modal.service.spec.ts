import { ModalService } from "./modal.service";

describe("Service", () => {
    describe("modal.service", () => {
        describe("open", () => {
            it("should call ui.boostrap.modal open method with options", () => {
                // arrange
                let modalMock = jasmine.createSpyObj("uiModal", ["open"]);
                let service = new ModalService(modalMock);
                let options = { controller: "myController", templateUrl: "./myTemplate.html" };

                // act
                service.open(options);

                // act
                expect(modalMock.open).toHaveBeenCalledWith(options);
            });
        });

        describe("dismiss", () => {
            it("should not call dismiss when modalInstance is not set", () => {
                // arrange
                let uiModalMock = jasmine.createSpyObj("uiModal", ["open"]);
                let service = new ModalService(<any>uiModalMock);

                // act | assert
                expect(() => service.dismiss()).not.toThrowError();
            });

            it("should call dismiss when modalInstance is set", () => {
                // arrange
                let uiModalMock = {
                    open: function () { }
                };
                let modalInstanceMock = jasmine.createSpyObj("modalInstance", ["dismiss"]);
                spyOn(uiModalMock, "open").and.returnValue(modalInstanceMock);
                let service = new ModalService(<any>uiModalMock);
                let options = { controller: "myController", templateUrl: "./myTemplate.html" };
                service.open(options);

                // act
                service.dismiss();

                // assert
                expect(modalInstanceMock.dismiss).toHaveBeenCalled();
            });
        });

        describe("close", () => {
            it("should not call close when modalInstance is not set", () => {
                // arrange
                let uiModalMock = jasmine.createSpyObj("uiModal", ["open"]);
                let service = new ModalService(<any>uiModalMock);

                // act | assert
                expect(() => service.close()).not.toThrowError();
            });

            it("should call close when modalInstance is set", () => {
                // arrange
                let uiModalMock = {
                    open: function () { }
                };
                let modalInstanceMock = jasmine.createSpyObj("modalInstance", ["close"]);
                spyOn(uiModalMock, "open").and.returnValue(modalInstanceMock);
                let service = new ModalService(<any>uiModalMock);
                let options = { controller: "myController", templateUrl: "./myTemplate.html" };
                service.open(options);

                // act
                service.close();

                // assert
                expect(modalInstanceMock.close).toHaveBeenCalled();
            });
        });
    });
});