import * as angular from "angular";
import { SharedModule } from "./shared.module";
import { HttpService, NotificationService, SocketService } from "./index";

describe("Modules", () => {
    describe("SharedModule", () => {
        let socketService: SocketService;
        let httpService: HttpService;
        let notificationService: NotificationService;
        let $filter: ng.IFilterService;

        beforeEach(angular.mock.module(SharedModule));
        beforeEach(inject((_httpService_, _notificationService_, _socketService_, _$filter_) => {
            httpService = _httpService_;
            notificationService = _notificationService_;
            socketService = _socketService_;
            $filter = _$filter_;
        }));

        it("should resolve httpService", () => {
            expect(httpService).toBeDefined();
        });

        it("should resolve notificationService", () => {
            expect(notificationService).toBeDefined();
        });

        it("should resolve socketService", () => {
            expect(socketService).toBeDefined();
        });

        it("should resolve plural filter", () => {
            let filter = $filter("plural")
            expect(filter).toBeDefined();
        });

        it("should resolve trusted filter", () => {
            let filter = $filter("trusted")
            expect(filter).toBeDefined();
        });
    });
});