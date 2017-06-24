import * as angular from "angular";
import { SharedModule } from "./shared.module";
import { HttpService, NotificationService } from "../services/index";

describe("Modules", () => {
    describe("SharedModule", () => {
        let httpService: HttpService;
        let notificationService: NotificationService;
        let config: ClientAppConfig.ClientConfiguration;
        let createComponent = (name: string, locals: any, bindings: any) => { };

        beforeEach(angular.mock.module(SharedModule));
        beforeEach(inject((_$componentController_: ng.IComponentControllerService, _httpService_, _notificationService_, _config_) => {
            httpService = _httpService_;
            notificationService = _notificationService_;
            config = _config_;

            createComponent = (name: string, locals: any, bindings: any) => _$componentController_(name, locals, bindings);
        }));

        it("should resolve httpService", () => {
            expect(httpService).toBeDefined();
        });

        it("should resolve config", () => {
            expect(config).toBeDefined();
        });

        it("should resolve notificationService", () => {
            expect(notificationService).toBeDefined();
        });

        it("should resolve footerComponent", () => {
            let component = createComponent("pcard-footer", null, {});
            expect(component).toBeDefined();
        });

        it("should resolve menuComponent", () => {
            let component = createComponent("pcard-menu", null, {});
            expect(component).toBeDefined();
        });

        it("should resolve headerComponent", () => {
            let component = createComponent("pcard-header", null, {});
            expect(component).toBeDefined();
        });
    });
});