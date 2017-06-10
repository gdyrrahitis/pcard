import * as angular from "angular";
import { MenuController } from "./menu.controller";

describe("Controller", () => {

    beforeEach(() => {
        let SocketService = function () {
            return {
                // tslint:disable-next-line:no-empty
                on: function () { },
                // tslint:disable-next-line:no-empty
                emit: function () { },
                // tslint:disable-next-line:no-empty
                getId: function () { }
            };
        };
        angular.module("app", ["ngSanitize", "ngRoute", "ngStorage"])
            .controller("menuController", MenuController)
            .service("socketService", ["$rootScope", SocketService]);
    });

    describe("Menu", () => {
        let $scope: IMenuControllerScope;
        let createController: () => MenuController;
        let socketService;
        let locationService;
        let localStorageService;

        beforeEach(angular.mock.module("app"));
        beforeEach(angular.mock.inject(function ($rootScope, $controller, _socketService_, $location, $localStorage) {
            $scope = <IMenuControllerScope>$rootScope.$new();
            socketService = _socketService_;
            spyOn(socketService, "emit");

            locationService = $location;
            spyOn(locationService, "path");

            localStorageService = $localStorage;

            createController = () => {
                return <MenuController>$controller("menuController", {
                    $scope: $scope,
                    locationService,
                    localStorageService,
                    socketService
                });
            }
        }));

        describe("navigateToHome", () => {
            it("should not emit 'room-leave' when id is not set", () => {
                // arrange
                localStorageService.id = undefined;
                let controller = createController();

                // act
                controller.navigateToHome();

                // assert
                expect(socketService.emit).not.toHaveBeenCalled();
                expect(locationService.path).toHaveBeenCalledWith("/");
            });

            it("should navigate to home", () => {
                // arrange
                let id = "5";
                localStorageService.id = id;
                let controller = createController();

                // act
                controller.navigateToHome();

                // assert
                expect(socketService.emit).toHaveBeenCalled();
                expect(socketService.emit).toHaveBeenCalledWith("room-leave", { id: id });
                expect(locationService.path).toHaveBeenCalledWith("/");
            });
        });
    });
});