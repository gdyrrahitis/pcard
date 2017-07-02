import * as angular from "angular";

import { SharedModule } from "../../shared.module";
import { NotificationService } from "./notification.service";

describe("Services", () => {
    describe("NotificationService", () => {
        let service;
        let toastrMock = jasmine.createSpyObj("toastr", ["success", "info", "warning", "error"]);
        let options: ToastrOptions = { progressBar: true };

        beforeEach(angular.mock.module(SharedModule));
        beforeEach(angular.mock.module(SharedModule, ($provide) => {
            // Decorate current $toastr value service to use a mock implementation
            $provide.decorator("$toastr", ["$delegate", ($delegate) => {
                return toastrMock;
            }]);
        }));
        beforeEach(inject((_notificationService_) => {
            service = _notificationService_;
        }));
        describe("success", () => {
            it("should call success with message", () => {
                service.success("Hello!");
                expect(toastrMock.success).toHaveBeenCalledWith("Hello!", undefined, undefined);
            });

            it("should call success with message and title", () => {
                service.success("Hello!", "Title");
                expect(toastrMock.success).toHaveBeenCalledWith("Hello!", "Title", undefined);
            });

            it("should call success with message, title and options", () => {
                service.success("Hello!", "Title", options);
                expect(toastrMock.success).toHaveBeenCalledWith("Hello!", "Title", options);
            });
        });

        describe("info", () => {
            it("should call info with message", () => {
                service.info("Hello!");
                expect(toastrMock.info).toHaveBeenCalledWith("Hello!", undefined, undefined);
            });

            it("should call info with message and title", () => {
                 service.info("Hello!", "Title");
                expect(toastrMock.info).toHaveBeenCalledWith("Hello!", "Title", undefined);
            });

            it("should call info with message, title and options", () => {
                service.info("Hello!", "Title", options);
                expect(toastrMock.info).toHaveBeenCalledWith("Hello!", "Title", options);
            });
        });

        describe("warning", () => {
            it("should call warning with message", () => {
                service.warning("Hello!");
                expect(toastrMock.warning).toHaveBeenCalledWith("Hello!", undefined, undefined);
            });

            it("should call warning with message and title", () => {
                service.warning("Hello!", "Title");
                expect(toastrMock.warning).toHaveBeenCalledWith("Hello!", "Title", undefined);
            });

            it("should call warning with message, title and options", () => {
                service.warning("Hello!", "Title", options);
                expect(toastrMock.warning).toHaveBeenCalledWith("Hello!", "Title", options);
            });
        });

        describe("error", () => {
            it("should call error with message", () => {
                service.error("Hello!");
                expect(toastrMock.error).toHaveBeenCalledWith("Hello!", undefined, undefined);
            });

            it("should call error with message and title", () => {
                service.error("Hello!", "Title");
                expect(toastrMock.error).toHaveBeenCalledWith("Hello!", "Title", undefined);
            });

            it("should call error with message, title and options", () => {
                service.error("Hello!", "Title", options);
                expect(toastrMock.error).toHaveBeenCalledWith("Hello!", "Title", options);
            });
        });
    });
});