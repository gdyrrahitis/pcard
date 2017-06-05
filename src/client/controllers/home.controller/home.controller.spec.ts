import * as angular from "angular";
import { HomeController } from "./home.controller";

describe("Controller", () => {
    let socketIo;
    beforeEach(() => {
        socketIo = function ($rootScope: ng.IScope) {
            let events: { eventName: string, callback: any }[] = [];
            let on = (eventName: string, callback: any) => {
                events.push({ eventName: eventName, callback: callback });
            };

            let emit = (eventName: string, data: any) => {
                let event = events.filter(evt => evt.eventName === eventName)[0];
                if (event) {
                    event.callback(data);
                }
            };
            return {
                on: on,
                emit: emit,
                socketId: "socketId1234"
            };
        };
        angular.module("app", ["ngSanitize", "ngRoute", "ngStorage"])
            .controller("homeController", HomeController)
            .factory("socketService", ["$rootScope", socketIo]);
    });

    describe("Home", () => {
        let $scope: IHomeControllerScope;
        let $controllerProvider;
        let service;

        beforeEach(angular.mock.module("app"));
        beforeEach(angular.mock.inject(function ($rootScope: any, $controller: any, _socketService_: any) {
            $scope = <IHomeControllerScope>$rootScope.$new();
            service = _socketService_;
            $controllerProvider = $controller;
        }));

        describe("internal-server-error", () => {
            it("should have $scope.error to undefined for non-invoked event", () => {
                // arrange | act
                <HomeController>$controllerProvider("homeController", { $scope: $scope, service });

                // assert
                expect($scope.error).toBeUndefined();
            });

            it("should set $scope.error to with message when internal server error is thrown", () => {
                // arrange | act
                <HomeController>$controllerProvider("homeController", { $scope: $scope, service });
                service.emit("internal-server-error", new Error("Unhandled exception"));

                // assert
                expect($scope.error).toBe("Unhandled exception");
            });
        });

        describe("room-not-found", () => {
            it("should have $scope.error to undefined for non-invoked event", () => {
                // arrange | act
                <HomeController>$controllerProvider("homeController", { $scope: $scope, service });

                // assert
                expect($scope.error).toBeUndefined();
            });

            it("should set $scope.error to with message when room not found", () => {
                // arrange | act
                <HomeController>$controllerProvider("homeController", { $scope: $scope, service });
                service.emit("room-not-found", []);

                // assert
                expect($scope.error).toBe("Could not find room.");
            });
        });

        describe("rooms-full", () => {
            it("should have $scope.error to undefined for non-invoked event", () => {
                // arrange | act
                <HomeController>$controllerProvider("homeController", { $scope: $scope, service });

                // assert
                expect($scope.error).toBeUndefined();
            });

            it("should set $scope.error to with message regarding rooms when all rooms are busy", () => {
                // arrange | act
                <HomeController>$controllerProvider("homeController", { $scope: $scope, service });
                service.emit("rooms-full", []);

                // assert
                expect($scope.error).toBe("All rooms are busy. Try again later!");
            });
        });

        describe("disconnect", () => {
            it("should emit 'disconnect' when id is set", () => {
                // arrange | act
                spyOn(service, "emit");
                <HomeController>$controllerProvider("homeController", { $scope: $scope, service });

                // assert
                expect(service.emit).toHaveBeenCalledWith("disconnect", socketIo().socketId);
            });

            it("should not emit 'disconnect' when id is not set", () => {
                // arrange | act
                service.socketId = undefined;
                spyOn(service, "emit");
                <HomeController>$controllerProvider("homeController", { $scope: $scope, service });

                // assert
                expect(service.emit).not.toHaveBeenCalled();
            });
        });

        describe("createRoom", () => {
            it("should not emit 'room-create' when submitRoom is called and form is not valid", () => {
                // arrange
                let controller = <HomeController>$controllerProvider("homeController", { $scope: $scope, service });
                spyOn(service, "emit");
                let form = {
                    $valid: false
                };

                // act
                controller.createRoom(<any>form);

                // assert
                expect(service.emit).not.toHaveBeenCalled();
            });

            it("should emit 'room-create' when createRoom is called", () => {
                // arrange
                let controller = <HomeController>$controllerProvider("homeController", { $scope: $scope, service });
                $scope.name = "George";
                spyOn(service, "emit");
                let form = {
                    $valid: true
                };

                // act
                controller.createRoom(<any>form);

                // assert
                expect(service.emit).toHaveBeenCalledWith("room-create", { name: "George" }, jasmine.any(Function));
            });
        });

        describe("submitRoom", () => {
            it("should emit 'room-join' when submitRoom is called and form is valid", () => {
                // arrange
                let controller = <HomeController>$controllerProvider("homeController", { $scope: $scope, service });
                $scope.guestName = "George";
                spyOn(service, "emit");
                let form = {
                    $valid: true
                };
                $scope.room = 2;

                // act
                controller.submitRoom(<any>form);

                // assert
                expect(service.emit).toHaveBeenCalledWith("room-join", { roomId: 2, name: "George" }, jasmine.any(Function));
            });

            it("should not emit 'room-join' when submitRoom is called and form is not valid", () => {
                // arrange
                let controller = <HomeController>$controllerProvider("homeController", { $scope: $scope, service });
                spyOn(service, "emit");
                let form = {
                    $valid: false
                };

                // act
                controller.submitRoom(<any>form);

                // assert
                expect(service.emit).not.toHaveBeenCalled();
            });
        });
    });
});