import * as angular from "angular";
import * as toast from "toastr";
import { HomeController } from "./home.controller";
import { SocketService, ModalService, NotificationService, HttpService } from "../../services/index";

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
            .controller("homeController", ["$scope", "$location", "$localStorage", "socketService", "notificationService", "modalService", "httpService", HomeController])
            .service("socketService", ["$rootScope", "socket", SocketService])
            .service("modalService", ["$uibModal", ModalService])
            .service("httpService", ["$http", HttpService])
            .service("notificationService", ["$toastr", NotificationService]);
    });

    describe("Home", () => {
        let $scope: IHomeControllerScope;
        let controller;
        let socketService;
        let notificationService;
        let locationService;
        let httpService;
        let localStorageService;
        let modalService;

        beforeEach(angular.mock.module("app"));
        beforeEach(angular.mock.inject(function ($rootScope: any, $controller: any,
            _$location_: any, _socketService_: any, _notificationService_: any,
            _$localStorage_, _httpService_, _modalService_) {
            $scope = <IHomeControllerScope>$rootScope.$new();
            locationService = _$location_;
            localStorageService = _$localStorage_;
            socketService = _socketService_;
            notificationService = _notificationService_;
            httpService = _httpService_;
            modalService = _modalService_;
            controller = <HomeController>$controller("homeController", {
                $scope: $scope,
                locationService,
                localStorage,
                socketService,
                notificationService,
                modalService,
                httpService
            });
        }));

        describe("internal-server-error", () => {
            it("should have $scope.alerts to be empty for non-invoked event", () => {
                expect($scope.alerts.length).toBe(0);
            });

            it("should add to $scope.alerts and alert with message when internal server error is thrown", () => {
                // arrange | act
                socketService.emit("internal-server-error", new Error("Unhandled exception"));

                // assert
                expect($scope.alerts[0].message).toBe("Unhandled exception");
            });
        });

        describe("room-not-found", () => {
            it("should have $scope.alerts empty for non-invoked event", () => {
                expect($scope.alerts.length).toBe(0);
            });

            it("should add tp $scope.alerts an alert with message when room not found", () => {
                // arrange | act
                socketService.emit("room-not-found", []);

                // assert
                expect($scope.alerts[0].message).toBe("Could not find room");
            });
        });

        describe("rooms-full", () => {
            it("should have $scope.alerts empty for non-invoked event", () => {
                expect($scope.alerts.length).toBe(0);
            });

            it("should add to $scope.alerts an alert with message when all rooms are busy", () => {
                // arrange | act
                socketService.emit("rooms-full", []);

                // assert
                expect($scope.alerts[0].message).toBe("All rooms are being used. Try again later!");
            });
        });

        describe("createRoom", () => {
            it("should emit 'room-create' when createRoom is called", () => {
                // arrange
                $scope.name = "George";
                spyOn(socketService, "emit");

                // act
                controller.createRoom();

                // assert
                expect(socketService.emit).toHaveBeenCalledWith("room-create", { name: "George" }, jasmine.any(Function));
            });

            it("should not emit 'room-create' when createRoom is called with no username", () => {
                // arrange
                $scope.username = undefined;
                spyOn(socketService, "emit");
                spyOn(notificationService, "error");

                // act
                controller.createRoom();

                // assert
                expect(socketService.emit).not.toHaveBeenCalled();
                expect(notificationService.error).toHaveBeenCalledWith("Please provide a username", "Error", { progressBar: true });
            });
        });

        describe("joinRoom", () => {
            it("should emit 'room-join' when joinRoom is called and roomId and username are valid", () => {
                // arrange
                $scope.username = "George";
                spyOn(socketService, "emit");

                // act
                controller.joinRoom("1234");

                // assert
                expect(socketService.emit).toHaveBeenCalledWith("room-join", { roomId: "1234", name: "George" }, jasmine.any(Function));
            });

            it("should not emit 'room-join' when joinRoom is called with valid roomId but no username", () => {
                // arrange
                $scope.username = undefined;
                spyOn(socketService, "emit");
                spyOn(notificationService, "error");

                // act
                controller.joinRoom("1234");

                // assert
                expect(socketService.emit).not.toHaveBeenCalled();
                expect(notificationService.error).toHaveBeenCalledWith("Please provide a username", "Error", { progressBar: true });
            });

            it("should not emit 'room-join' when joinRoom is called and roomId is not valid", () => {
                // arrange
                $scope.username = "George";
                spyOn(socketService, "emit");
                spyOn(notificationService, "error");

                // act
                controller.joinRoom(undefined);

                // assert
                expect(socketService.emit).not.toHaveBeenCalled();
                expect(notificationService.error).toHaveBeenCalledWith("Room id is not valid, please provide one", "Error", { progressBar: true });
            });
        });
    });
});