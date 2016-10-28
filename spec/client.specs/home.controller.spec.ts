import { HomeController } from "../../src/home.controller/home.controller";

describe("HomeController spec", () => {

    beforeEach(() => {
        let SocketService = function () {
            return {
                on: function () { },
                emit: function () { },
                getId: function () { }
            };
        };
        angular.module("app", ["ngSanitize", "ngRoute", "ngStorage"])
            .controller("homeController", HomeController)
            .factory("socketService", ["$rootScope", SocketService]);
    });

    describe("Controller", () => {
        let $scope: IHomeControllerScope;
        let controller: HomeController;
        let service;

        beforeEach(angular.mock.module("app"));
        beforeEach(angular.mock.inject(function ($rootScope, $controller, _socketService_) {
            $scope = <IHomeControllerScope>$rootScope.$new();
            service = _socketService_;
            controller = <HomeController>$controller("homeController", {
                $scope: $scope,
                service
            });
        }));

        xit("should set $scope.error to with message when room not found", () => {
            // Arrange | Act

            // Assert
            expect($scope.error).toBe("Could not find room.");
        });

        xit("should set $scope.error to with message regarding access when access is denied to room", () => {
            expect(false).toBeTruthy();
        });

        xit("should set $scope.error to with message regarding rooms when all rooms are busy", () => {
            expect(false).toBeTruthy();
        });

        xit("should not emit 'disconnect' when id is set", () => {
            expect(false).toBeTruthy();
        });

        xit("should emit 'disconnect' when id is not set", () => {
            expect(false).toBeTruthy();
        });

        xit("should emit 'create-private' when createRoom is called", () => {
            expect(false).toBeTruthy();
        });

        xit("should emit 'join-private' when submitRoom is called and form is valid", () => {
            expect(false).toBeTruthy();
        });

        xit("should not emit 'join-private' when submitRoom is called and form is not valid", () => {
            expect(false).toBeTruthy();
        });
    });
});