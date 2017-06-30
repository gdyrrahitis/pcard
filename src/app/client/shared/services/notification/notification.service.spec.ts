import { NotificationService } from "./notification.service";

describe("Service", () => {
    describe("notification.service", () => {
        describe("success", () => {
            it("should call success with message", () => {
                // arrange
                let toastrMock = jasmine.createSpyObj("toastr", ["success"]);
                let service = new NotificationService(toastrMock);

                // act
                service.success("Hello!");

                // assert
                expect(toastrMock.success).toHaveBeenCalledWith("Hello!", undefined, undefined);
            });

            it("should call success with message and title", () => {
                // arrange
                let toastrMock = jasmine.createSpyObj("toastr", ["success"]);
                let service = new NotificationService(toastrMock);

                // act
                service.success("Hello!", "Title");

                // assert
                expect(toastrMock.success).toHaveBeenCalledWith("Hello!", "Title", undefined);
            });

            it("should call success with message, title and options", () => {
                // arrange
                let toastrMock = jasmine.createSpyObj("toastr", ["success"]);
                let service = new NotificationService(toastrMock);

                // act
                service.success("Hello!", "Title", { progressBar: true });

                // assert
                expect(toastrMock.success).toHaveBeenCalledWith("Hello!", "Title", { progressBar: true });
            });
        });

        describe("info", () => {
            it("should call info with message", () => {
                // arrange
                let toastrMock = jasmine.createSpyObj("toastr", ["info"]);
                let service = new NotificationService(toastrMock);

                // act
                service.info("Hello!");

                // assert
                expect(toastrMock.info).toHaveBeenCalledWith("Hello!", undefined, undefined);
            });

            it("should call info with message and title", () => {
                // arrange
                let toastrMock = jasmine.createSpyObj("toastr", ["info"]);
                let service = new NotificationService(toastrMock);

                // act
                service.info("Hello!", "Title");

                // assert
                expect(toastrMock.info).toHaveBeenCalledWith("Hello!", "Title", undefined);
            });

            it("should call info with message, title and options", () => {
                // arrange
                let toastrMock = jasmine.createSpyObj("toastr", ["info"]);
                let service = new NotificationService(toastrMock);

                // act
                service.info("Hello!", "Title", { progressBar: true });

                // assert
                expect(toastrMock.info).toHaveBeenCalledWith("Hello!", "Title", { progressBar: true });
            });
        });

        describe("warning", () => {
            it("should call warning with message", () => {
                // arrange
                let toastrMock = jasmine.createSpyObj("toastr", ["warning"]);
                let service = new NotificationService(toastrMock);

                // act
                service.warning("Hello!");

                // assert
                expect(toastrMock.warning).toHaveBeenCalledWith("Hello!", undefined, undefined);
            });

            it("should call warning with message and title", () => {
                // arrange
                let toastrMock = jasmine.createSpyObj("toastr", ["warning"]);
                let service = new NotificationService(toastrMock);

                // act
                service.warning("Hello!", "Title");

                // assert
                expect(toastrMock.warning).toHaveBeenCalledWith("Hello!", "Title", undefined);
            });

            it("should call warning with message, title and options", () => {
                // arrange
                let toastrMock = jasmine.createSpyObj("toastr", ["warning"]);
                let service = new NotificationService(toastrMock);

                // act
                service.warning("Hello!", "Title", { progressBar: true });

                // assert
                expect(toastrMock.warning).toHaveBeenCalledWith("Hello!", "Title", { progressBar: true });
            });
        });

        describe("error", () => {
            it("should call error with message", () => {
                // arrange
                let toastrMock = jasmine.createSpyObj("toastr", ["error"]);
                let service = new NotificationService(toastrMock);

                // act
                service.error("Hello!");

                // assert
                expect(toastrMock.error).toHaveBeenCalledWith("Hello!", undefined, undefined);
            });

            it("should call error with message and title", () => {
                // arrange
                let toastrMock = jasmine.createSpyObj("toastr", ["error"]);
                let service = new NotificationService(toastrMock);

                // act
                service.error("Hello!", "Title");

                // assert
                expect(toastrMock.error).toHaveBeenCalledWith("Hello!", "Title", undefined);
            });

            it("should call error with message, title and options", () => {
                // arrange
                let toastrMock = jasmine.createSpyObj("toastr", ["error"]);
                let service = new NotificationService(toastrMock);

                // act
                service.error("Hello!", "Title", { progressBar: true });

                // assert
                expect(toastrMock.error).toHaveBeenCalledWith("Hello!", "Title", { progressBar: true });
            });
        });
    });
});