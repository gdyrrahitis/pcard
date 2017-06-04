import * as angular from "angular";
import { RoomController } from "./room.controller";
import { UserRole, Moderator, Guest } from "../../../domain/user";

describe("Controller", () => {
    let config: ClientAppConfig.ClientConfiguration = require("../../client.config.json");

    beforeEach(() => {
        let socketIo = function ($rootScope: ng.IScope) {
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
            .constant("configuration", config)
            .controller("roomController", RoomController)
            .factory("socketService", ["$rootScope", socketIo]);
    });

    describe("Room", () => {
        let $scope: IRoomControllerScope;
        let controller: RoomController;
        let socketService;
        let locationService;
        let localStorageService;

        beforeEach(angular.mock.module("app"));

        beforeEach(angular.mock.inject(($rootScope, $controller, _socketService_, $localStorage) => {
            $scope = <IRoomControllerScope>$rootScope.$new();
            socketService = _socketService_;

            localStorageService = $localStorage;

            controller = <RoomController>$controller("roomController", {
                $scope: $scope,
                locationService,
                localStorageService,
                socketService
            });
        }));

        describe("ban", () => {
            it("should broadcast ban when user is banned", () => {
                // arrange
                spyOn(socketService, "emit");
                let user: IUser = { id: 1, room: 5, userId: localStorageService.id };

                // act
                controller.banUser(user);

                // assert
                expect(socketService.emit).toHaveBeenCalledWith("ban", user);
            });
        });

        describe("selectCard", () => {
            it("should push new items in selectedList", () => {
                // arrange
                let element = { card: "card" };

                // act
                controller.selectCard(element);

                // assert
                expect($scope.selectedItem).toBe(element.card);
                expect($scope.selectedList.length).toBe(1);
            });
        });

        describe("room-show-all", () => {
            it("should return undefined current user and attendees when 'room-show-all' event raises with empty data", () => {
                // arrange | Act
                socketService.emit("room-show-all", []);

                // assert
                expect($scope.currentUser).toBeUndefined();
                expect($scope.attendees.length).toBe(0);
            });

            // tslint:disable-next-line:max-line-length
            it("should set current user to the one that is found in the users list and attendees to the rest when 'room-show-all' event raises", () => {
                // arrange
                let user: UserRole = new Moderator(localStorageService.id, "George");
                let otherUser: UserRole = new Guest("123", "John");
                let users: UserRole[] = [otherUser, user];

                // act
                socketService.emit("room-show-all", users);

                // assert
                expect($scope.currentUser).toBe(user);
                expect($scope.attendees.length).toBe(1);
                expect($scope.attendees[0]).toBe(otherUser);
            });
        });
    });
});