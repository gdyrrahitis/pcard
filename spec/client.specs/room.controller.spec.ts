import { RoomController } from "../../src/room.controller/room.controller";

describe("RoomController spec", () => {

    beforeEach(() => {
        let SocketService = function () {
            return {
                on: function () { },
                emit: function () { },
                getId: function () { }
            };
        };
        angular.module("app", ["ngSanitize", "ngRoute", "ngStorage"])
            .controller("roomController", RoomController)
            .factory("socketService", ["$rootScope", SocketService]);
    });

    describe("Controller", () => {
        let $scope: IRoomControllerScope;
        let controller: RoomController;
        let socketService;
        let locationService;
        let localStorageService;

        beforeEach(angular.mock.module("app"));
        beforeEach(angular.mock.inject(function ($rootScope, $controller, _socketService_, $localStorage) {
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

        it("should broadcast ban when user is banned", () => {
            // Arrange
            spyOn(socketService, "emit");
            let user: IUser = {
                id: 1,
                room: 5,
                userId: "123"
            };

            // Act
            controller.banUser(user);

            // Assert
            expect(socketService.emit).toHaveBeenCalledWith("ban", user);
        });

        it("should push new items in selectedList", () => {
            // Arrange
            let element = { card: "card" };

            // Act
            controller.selectCard(element);

            // Assert
            expect($scope.selectedItem).toBe(element.card);
            expect($scope.selectedList.length).toBe(1);
        });

        it("should set currentUser when 'show-attendees' event raises", () => {
            // Arrange | Act
            let id = 1;
            localStorageService.id = id;
            let user = { id: id };
            socketService.emit("show-attendees", []);

            // Assert
            expect($scope.currentUser).toBe(user);
        })
    });
});