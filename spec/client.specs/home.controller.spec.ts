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
        let $scope;
        let controller;

        beforeEach(angular.mock.module("app"));
        beforeEach(angular.mock.inject(function ($rootScope, $controller) {
            $scope = $rootScope.$new();
            controller = $controller("homeController", {
                $scope: $scope
            });
        }));

        it("should be truthy", () => {
            expect(true).toBeTruthy();
        });
    });
});