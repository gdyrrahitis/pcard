// import * as angular from "angular";
// import { RoomComponent } from "./room.component";
// import { SocketService } from "../../services/index";
// import { UserRole, Moderator, Guest } from "../../../domain/user";

// xdescribe("Controller", () => {
//     let socketIo;
//     let config: ClientAppConfig.ClientConfiguration = require("../../client.config.json");

//     beforeEach(() => {
//         socketIo = function ($rootScope: ng.IScope) {
//             let events: { eventName: string, callback: any }[] = [];
//             let on = (eventName: string, callback: any) => {
//                 events.push({ eventName: eventName, callback: callback });
//             };

//             let emit = (eventName: string, data: any, callback: any) => {
//                 let event = events.filter(evt => evt.eventName === eventName)[0];
//                 if (event) {
//                     event.callback(data);
//                 }
//             };
//             return {
//                 on: on,
//                 emit: emit,
//                 id: "socketId1234"
//             };
//         };

//         angular.module("app", ["ui.bootstrap", "ngSanitize", "ngRoute", "ngStorage"])
//             .service("socket", socketIo)
//             .constant("cards", config.poker.mountainGoat)
//             .service("socketService", ["$rootScope", "socket", SocketService])
//             .controller("roomController", ["$scope", "$rootScope", "$location", "$routeParams", "$localStorage", "socketService", "cards", "$window", RoomComponent]);
//     });

//     describe("Room", () => {
//         let $scope: IRoomControllerScope;
//         let createController: () => RoomComponent;
//         let socketService;
//         let $logProvider;
//         let logService;
//         let localStorageService;
//         let $routeParams;
//         let locationService;
//         let cards: string[];
//         let rootScope;
//         let $window: ng.IWindowService;
//         let socket;

//         beforeEach(angular.mock.module("app"));

//         beforeEach(angular.mock.inject(($rootScope, $controller, _$location_, _socketService_,
//             _$routeParams_, $localStorage, _cards_, _$window_, _socket_) => {
//             rootScope = $rootScope;
//             $scope = <IRoomControllerScope>$rootScope.$new();
//             socketService = _socketService_;
//             locationService = _$location_;
//             localStorageService = $localStorage;
//             $routeParams = _$routeParams_;
//             cards = _cards_;
//             $window = _$window_;
//             socket = _socket_;

//             createController = () => {
//                 return <RoomComponent>$controller("roomController", {
//                     $scope: $scope,
//                     rootScope,
//                     locationService,
//                     $routeParams,
//                     localStorageService,
//                     socketService,
//                     cards,
//                     $window
//                 });
//             }
//         }));

//         describe("ban", () => {
//             it("should broadcast ban when user is banned", () => {
//                 // arrange
//                 $routeParams.id = "abc123";
//                 spyOn(socketService, "emit");
//                 spyOn(rootScope, "$on");
//                 let controller = createController();
//                 let user: UserRole = new Guest(localStorageService.id, "George");

//                 // act
//                 controller.banUser(user);

//                 // assert
//                 expect(socketService.emit).toHaveBeenCalledWith("ban", { roomId: $routeParams.id, userId: user.id });
//             });
//         });

//         describe("selectCard", () => {
//             it("should push new items in selectedList", () => {
//                 // arrange
//                 spyOn(rootScope, "$on");
//                 let element = { card: "card" };
//                 let controller = createController();

//                 // act
//                 controller.selectCard(element);

//                 // assert
//                 expect($scope.selectedItem).toBe(element.card);
//                 expect($scope.selectedList.length).toBe(1);
//             });
//         });

//         describe("room-show-all", () => {
//             it("should return undefined current user and attendees when 'room-show-all' event raises with empty data", () => {
//                 // arrange
//                 spyOn(rootScope, "$on");
//                 let controller = createController();

//                 // act
//                 socketService.emit("room-show-all", []);

//                 // assert
//                 expect($scope.currentUser).toBeUndefined();
//                 expect($scope.attendees.length).toBe(0);
//             });

//             // tslint:disable-next-line:max-line-length
//             it("should set current user to the one that is found in the users list and attendees to the rest when 'room-show-all' event raises", () => {
//                 // arrange
//                 spyOn(rootScope, "$on");
//                 let controller = createController();
//                 let user: UserRole = new Moderator(localStorageService.id, "George");
//                 let otherUser: UserRole = new Guest("123", "John");
//                 let users: UserRole[] = [otherUser, user];

//                 // act
//                 socketService.emit("room-show-all", users);

//                 // assert
//                 expect($scope.currentUser).toBe(user);
//                 expect($scope.attendees.length).toBe(1);
//                 expect($scope.attendees[0]).toBe(otherUser);
//             });
//         });

//         describe("room-get-all", () => {
//             it("should emit 'room-get-all' event with id from $routeParams", () => {
//                 // arramge
//                 spyOn(rootScope, "$on");
//                 spyOn(socketService, "emit");
//                 $routeParams.id = "1234";
//                 let controller = createController();

//                 // assert
//                 expect(socketService.emit).toHaveBeenCalledWith("room-get-all", { roomId: $routeParams.id });
//             });
//         });

//         describe("$locationChangeStart", () => {
//             it("should not show confirm dialog and should not emit 'room-disconnect' when user is banned", () => {
//                 // arrange
//                 $routeParams.id = "1234";
//                 spyOn(socketService, "emit");
//                 let controller = createController();
//                 $scope.$emit("user-ban-start");

//                 // act
//                 rootScope.$emit("$locationChangeStart");

//                 // assert
//                 expect(socketService.emit).not.toHaveBeenCalledWith("room-disconnect",
//                     { roomId: $routeParams.id, userId: localStorageService.id },
//                     jasmine.any(Function));
//             });

//             it("should show modal dialog but should not emit event because of cancellation", () => {
//                 // arrange
//                 $routeParams.id = "1234";
//                 spyOn(socketService, "emit");
//                 spyOn($window, "confirm").and.returnValue(false);
//                 let controller = createController();

//                 // act
//                 rootScope.$emit("$locationChangeStart");

//                 // assert
//                 expect($window.confirm).toHaveBeenCalledWith("Are you sure you want to leave?");
//                 expect(socketService.emit).not.toHaveBeenCalledWith("room-disconnect",
//                     { roomId: $routeParams.id, userId: localStorageService.id },
//                     jasmine.any(Function));
//             });

//             it("should show modal dialog and emit event after confirmation", () => {
//                 // arrange
//                 $routeParams.id = "1234";
//                 spyOn($window, "confirm").and.returnValue(true);
//                 spyOn(locationService, "path");
//                 let controller = createController();
//                 spyOn(socketService, "emit");

//                 // act
//                 rootScope.$emit("$locationChangeStart");

//                 //     // assert
//                 expect($window.confirm).toHaveBeenCalledWith("Are you sure you want to leave?");
//                 expect(socketService.emit).toHaveBeenCalledWith("room-disconnect",
//                     { roomId: $routeParams.id, userId: localStorageService.id },
//                     jasmine.any(Function));
//             });
//         });
//     });
// });