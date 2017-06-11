import * as angular from "angular";
import * as toast from "toastr";
import { HomeController } from "./home.controller";
import { SocketService, ModalService, NotificationService, HttpService } from "../../services/index";

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
        let createController: () => HomeController;
        let socketService;
        let notificationService;
        let locationService;
        let httpService;
        let localStorageService;
        let modalService;
        let $httpBackend: ng.IHttpBackendService;

        beforeEach(angular.mock.module("app"));
        beforeEach(angular.mock.inject(function ($rootScope: any, $controller: any,
            _$location_: any, _socketService_: any, _notificationService_: any,
            _$localStorage_, _httpService_, _modalService_, _$httpBackend_) {
            $scope = <IHomeControllerScope>$rootScope.$new();
            locationService = _$location_;
            localStorageService = _$localStorage_;
            socketService = _socketService_;
            notificationService = _notificationService_;
            httpService = _httpService_;
            modalService = _modalService_;
            $httpBackend = _$httpBackend_;

            createController = () => {
                return <HomeController>$controller("homeController", {
                    $scope: $scope,
                    locationService,
                    localStorage,
                    socketService,
                    notificationService,
                    modalService,
                    httpService
                });
            };
        }));

        afterEach(() => {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        describe("rooms", () => {
            it("should set $scope.totalRooms to returned data", () => {
                // arrange
                let limit = 10000;
                $httpBackend.expectGET("/rooms").respond(200, { limit: 10000 });

                // act
                let controller = createController();
                $httpBackend.flush();

                // assert
                expect($scope.totalRooms).toBe(limit);
            });

            it("should add to $scope.alerts with message", () => {
                // arrange
                $httpBackend.expectGET("/rooms").respond(404);

                // act
                let controller = createController();
                $httpBackend.flush();

                // assert
                expect($scope.totalRooms).toBeUndefined();
                expect($scope.alerts.length).toBe(1);
                expect($scope.alerts[0].message).toBe("Oh snap! An error occured, please try again later");
            });
        });

        describe("internal-server-error", () => {
            it("should have $scope.alerts to be empty for non-invoked event", () => {
                let controller = createController();
                expect($scope.alerts.length).toBe(0);
            });

            it("should add to $scope.alerts and alert with message when internal server error is thrown", () => {
                // arrange
                let controller = createController();

                // act
                socketService.emit("internal-server-error", new Error("Unhandled exception"));

                // assert
                expect($scope.alerts[0].message).toBe("Unhandled exception");
            });
        });

        describe("room-not-found", () => {
            it("should have $scope.alerts empty for non-invoked event", () => {
                let controller = createController();
                expect($scope.alerts.length).toBe(0);
            });

            it("should add tp $scope.alerts an alert with message when room not found", () => {
                // arrange
                let controller = createController();

                // act
                socketService.emit("room-not-found", []);

                // assert
                expect($scope.alerts[0].message).toBe("Could not find room");
            });
        });

        describe("rooms-full", () => {
            it("should have $scope.alerts empty for non-invoked event", () => {
                let controller = createController();
                expect($scope.alerts.length).toBe(0);
            });

            it("should add to $scope.alerts an alert with message when all rooms are busy", () => {
                // arrange
                let controller = createController();

                // act
                socketService.emit("rooms-full", []);

                // assert
                expect($scope.alerts[0].message).toBe("All rooms are being used. Try again later!");
            });
        });

        describe("createRoom", () => {
            it("should emit 'room-create' when createRoom is called and username is valid", () => {
                // arrange
                let controller = createController();
                let name = "George";
                $scope.username = name;
                spyOn(socketService, "emit");

                // act
                controller.createRoom();

                // assert
                expect(socketService.emit).toHaveBeenCalledWith("room-create", { name: name }, jasmine.any(Function));
            });

            it("should not emit 'room-create' when createRoom is called with no username", () => {
                // arrange
                let controller = createController();
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
                let controller = createController();
                $scope.username = "George";
                spyOn(socketService, "emit");

                // act
                controller.joinRoom("1234");

                // assert
                expect(socketService.emit).toHaveBeenCalledWith("room-join", { roomId: "1234", name: "George" }, jasmine.any(Function));
            });

            it("should not emit 'room-join' when joinRoom is called with valid roomId but no username", () => {
                // arrange
                let controller = createController();
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
                let controller = createController();
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

        describe("modal-join-result", () => {
            it("should not call joinRoom by initialization", () => {
                // arrange
                let controller = createController();
                spyOn(controller, "joinRoom");

                // assert
                expect(controller.joinRoom).not.toHaveBeenCalled();
            });

            it("should call joinRoom when 'modal-join-result' is emitted", () => {
                // arrange
                let controller = createController();
                spyOn(controller, "joinRoom");
                let $childScope = $scope.$new();

                // act
                $childScope.$emit("modal-join-result")

                // assert
                expect(controller.joinRoom).toHaveBeenCalled();
            });
        });

        describe("rooms-all", () => {
            it("should have $scope.rooms as undefined when event is not invoked for first time", () => {
                let controller = createController();
                expect($scope.rooms).toBeUndefined();
            });

            it("should set $scope.rooms to value emitted with event", () => {
                // arrange
                let controller = createController();

                // act
                socketService.emit("rooms-all", 10);

                // assert
                expect($scope.rooms).toBe(10);
            });
        });

        describe("users-all", () => {
            it("should have $scope.users as undefined when event is not invoked for first time", () => {
                let controller = createController();
                expect($scope.users).toBeUndefined();
            });

            it("should set $scope.users to value emitted with event", () => {
                // arrange
                let controller = createController();

                // act
                socketService.emit("users-all", 10);

                // assert
                expect($scope.users).toBe(10);
            });
        });

        describe("request-all-rooms", () => {
            it("should be emitted when controller is instantiated", () => {
                // arrange
                spyOn(socketService, "emit");

                // act
                let controller = createController();

                // assert
                expect(socketService.emit).toHaveBeenCalledWith("request-all-rooms");
            });
        });

        describe("request-all-users", () => {
            it("should be emitted when controller is instantiated", () => {
                // arrange
                spyOn(socketService, "emit");

                // act
                let controller = createController();

                // assert
                expect(socketService.emit).toHaveBeenCalledWith("request-all-users");
            });
        });

        describe("closeAlert", () => {
            it("should remove alerts from array on specified index", () => {
                // arrange
                let controller = createController();
                $scope.alerts = [{ message: "alert1" }, { message: "alert2" }, { message: "alert3" }];

                // act
                controller.closeAlert(1);

                // assert
                expect($scope.alerts.length).toBe(2);
                expect($scope.alerts.filter(a => a.message === "alert2")[0]).toBeUndefined();
            });
            
        });
    });
});