import "ngStorage";
import { MenuController } from "./menu.controller";

describe("MenuController spec", () => {

    beforeEach(() => {
        let SocketService = function () {
            return {
                on: function () { },
                emit: function () { },
                getId: function () { }
            };
        };
        angular.module("app", ["ngSanitize", "ngRoute", "ngStorage"])
            .controller("menuController", MenuController)
            .factory("socketService", ["$rootScope", SocketService]);
    });

    describe("Controller", () => {
        let $scope: IMenuControllerScope;
        let controller: MenuController;
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

            controller = <MenuController>$controller("menuController", {
                $scope: $scope,
                locationService,
                localStorageService,
                socketService
            });
        }));

        it("should navigate to home", () => {
            // Arrange
            let id = "5"
            localStorageService.id = id;

            // Act
            controller.navigateToHome();

            // Assert
            expect(socketService.emit).toHaveBeenCalled();
            expect(socketService.emit).toHaveBeenCalledWith("private-leave", {id: id});
            expect(locationService.path).toHaveBeenCalledWith("/");
        });
    });
});