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

        it("should set $scope.error to with message when room not found", () => {
            // arrange | act
            <HomeController>$controllerProvider("homeController", { $scope: $scope, service });
            service.emit("room-not-found", []);

            // assert
            expect($scope.error).toBe("Could not find room.");
        });

        it("should set $scope.error to with message regarding access when access is denied to room", () => {
            // arrange | act
            <HomeController>$controllerProvider("homeController", { $scope: $scope, service });
            service.emit("room-occupied", []);

            // assert
            expect($scope.error).toBe("Cannot access room because it is already booked!");
        });

        it("should set $scope.error to with message regarding rooms when all rooms are busy", () => {
            // arrange | act
            <HomeController>$controllerProvider("homeController", { $scope: $scope, service });
            service.emit("all-rooms-occupied", []);

            // assert
            expect($scope.error).toBe("All rooms are busy. Try again later!");
        });

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

        it("should emit 'create-private' when createRoom is called", () => {
            // arrange
            let controller = <HomeController>$controllerProvider("homeController", { $scope: $scope, service });
            spyOn(service, "emit");

            // act
            controller.createRoom();

            // assert
            expect(service.emit).toHaveBeenCalledWith("create-private", { userId: service.socketId, room: 1 }, jasmine.any(Function));
        });

        it("should emit 'join-private' when submitRoom is called and form is valid", () => {
            // arrange
            let controller = <HomeController>$controllerProvider("homeController", { $scope: $scope, service });
            spyOn(service, "emit");
            let form = {
                $valid: true
            };
            $scope.room = 2;

            // act
            controller.submitRoom(<any>form);

            // assert
            expect(service.emit).toHaveBeenCalledWith("join-private", { userId: service.socketId, room: 2 }, jasmine.any(Function));
        });

        it("should not emit 'join-private' when submitRoom is called and form is not valid", () => {
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