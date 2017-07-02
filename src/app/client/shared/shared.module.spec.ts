import * as angular from "angular";
import { SharedModule } from "./shared.module";
import { HttpService, NotificationService, SocketService } from "./index";

describe("Modules", () => {
    describe("SharedModule", () => {
        let socketService: SocketService;
        let httpService: HttpService;
        let notificationService: NotificationService;

        beforeEach(angular.mock.module(SharedModule));
        beforeEach(inject((_httpService_, _notificationService_, _socketService_) => {
            httpService = _httpService_;
            notificationService = _notificationService_;
            socketService = _socketService_;
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
    });
});