import * as angular from "angular";
import * as toast from "toastr";
import { HomeController } from "./home.controller";
import { SocketService, ModalService, NotificationService } from "../../services/index";

describe("Controller", () => {
    let socketIo;
    let notif;

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

        angular.module("app", ["ui.bootstrap", "ngSanitize", "ngRoute", "ngStorage"])
            .constant("$toastr", toast)
            .service("socket", socketIo)
            .controller("homeController", HomeController)
            .service("socketService", SocketService)
            .service("notificationService", ["$toastr", NotificationService]);
    });

    describe("Home", () => {
        let $scope: IHomeControllerScope;
        let $controllerProvider;
        let socketService;
        let notificationService;
        let locationService;

        beforeEach(angular.mock.module("app"));
        beforeEach(angular.mock.inject(function ($rootScope: any, $controller: any,
            _$location_: any, _socketService_: any, _notificationService_: any) {
            $scope = <IHomeControllerScope>$rootScope.$new();
            locationService = _$location_;
            socketService = _socketService_;
            notificationService = _notificationService_;
            $controllerProvider = $controller;
        }));

        describe("internal-server-error", () => {
            it("should have $scope.error to undefined for non-invoked event", () => {
                // arrange | act
                <HomeController>$controllerProvider("homeController", { $scope: $scope, socketService });

                // assert
                expect($scope.error).toBeUndefined();
            });

            it("should set $scope.error to with message when internal server error is thrown", () => {
                // arrange | act
                <HomeController>$controllerProvider("homeController", { $scope: $scope, socketService });
                socketService.emit("internal-server-error", new Error("Unhandled exception"));

                // assert
                expect($scope.error).toBe("Unhandled exception");
            });
        });

        describe("room-not-found", () => {
            it("should have $scope.error to undefined for non-invoked event", () => {
                // arrange | act
                <HomeController>$controllerProvider("homeController", { $scope: $scope, socketService });

                // assert
                expect($scope.error).toBeUndefined();
            });

            it("should set $scope.error to with message when room not found", () => {
                // arrange | act
                <HomeController>$controllerProvider("homeController", { $scope: $scope, socketService });
                socketService.emit("room-not-found", []);

                // assert
                expect($scope.error).toBe("Could not find room.");
            });
        });

        describe("rooms-full", () => {
            it("should have $scope.error to undefined for non-invoked event", () => {
                // arrange | act
                <HomeController>$controllerProvider("homeController", { $scope: $scope, socketService });

                // assert
                expect($scope.error).toBeUndefined();
            });

            it("should set $scope.error to with message regarding rooms when all rooms are busy", () => {
                // arrange | act
                <HomeController>$controllerProvider("homeController", { $scope: $scope, socketService });
                socketService.emit("rooms-full", []);

                // assert
                expect($scope.error).toBe("All rooms are being used. Try again later!");
            });
        });

        // TODO: Move to room
        xdescribe("disconnect", () => {
            it("should emit 'disconnect' when id is set", () => {
                // arrange | act
                spyOn(socketService, "emit");
                <HomeController>$controllerProvider("homeController", { $scope: $scope, socketService });

                // assert
                expect(socketService.emit).toHaveBeenCalledWith("disconnect", socketIo().socketId);
            });

            it("should not emit 'disconnect' when id is not set", () => {
                // arrange | act
                socketService.socketId = undefined;
                spyOn(socketService, "emit");
                <HomeController>$controllerProvider("homeController", { $scope: $scope, socketService });

                // assert
                expect(socketService.emit).not.toHaveBeenCalled();
            });
        });

        describe("createRoom", () => {
            it("should not emit 'room-create' when submitRoom is called and form is not valid", () => {
                // arrange
                let controller = <HomeController>$controllerProvider("homeController", { $scope: $scope, socketService });
                spyOn(socketService, "emit");
                let form = {
                    $valid: false
                };

                // act
                controller.createRoom(<any>form);

                // assert
                expect(socketService.emit).not.toHaveBeenCalled();
            });

            it("should emit 'room-create' when createRoom is called", () => {
                // arrange
                let controller = <HomeController>$controllerProvider("homeController", { $scope: $scope, socketService });
                $scope.name = "George";
                spyOn(socketService, "emit");
                let form = {
                    $valid: true
                };

                // act
                controller.createRoom(<any>form);

                // assert
                expect(socketService.emit).toHaveBeenCalledWith("room-create", { name: "George" }, jasmine.any(Function));
            });
        });

        describe("submitRoom", () => {
            it("should emit 'room-join' when submitRoom is called and form is valid", () => {
                // arrange
                let controller = <HomeController>$controllerProvider("homeController", { $scope: $scope, socketService });
                $scope.guestName = "George";
                spyOn(socketService, "emit");
                let form = {
                    $valid: true
                };
                $scope.room = 2;

                // act
                controller.submitRoom(<any>form);

                // assert
                expect(socketService.emit).toHaveBeenCalledWith("room-join", { roomId: 2, name: "George" }, jasmine.any(Function));
            });

            it("should not emit 'room-join' when submitRoom is called and form is not valid", () => {
                // arrange
                let controller = <HomeController>$controllerProvider("homeController", { $scope: $scope, socketService });
                spyOn(socketService, "emit");
                let form = {
                    $valid: false
                };

                // act
                controller.submitRoom(<any>form);

                // assert
                expect(socketService.emit).not.toHaveBeenCalled();
            });
        });

        describe("user-disconnected", () => {
            it("should show warning notification with message and progress bar", () => {
                // arrange
                spyOn(notificationService, "warning");
                let controller = <HomeController>$controllerProvider("homeController", { $scope: $scope, locationService, socketService, notificationService });
                let roomId = "123";
                let options: ToastrOptions = { progressBar: true };

                // act
                socketService.emit("user-disconnected", roomId);

                // assert
                expect(notificationService.warning)
                    .toHaveBeenCalledWith(`User disconnected from room: ${roomId}`, "Disconnect", options);
            });

            it("should show error notification with message and progress bar for undefined roomId", () => {
                // arrange
                spyOn(notificationService, "error");
                let controller = <HomeController>$controllerProvider("homeController", { $scope: $scope, locationService, socketService, notificationService });
                let options: ToastrOptions = { progressBar: true };

                // act
                socketService.emit("user-disconnected", undefined);

                // assert
                expect(notificationService.error)
                    .toHaveBeenCalledWith(`Room id is not defined, unexpected error occured`, "Error", options);
            });
        });
    });
});