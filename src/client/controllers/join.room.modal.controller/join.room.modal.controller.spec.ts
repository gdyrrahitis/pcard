import * as angular from "angular";
import { ModalService } from "../../services/index";
import { JoinRoomModalController } from "./join.room.modal.controller";

describe("Controller", () => {
    beforeEach(() => {
        angular.module("app", ["ui.bootstrap"])
            .controller("joinModalController", ["$scope", "$uibModalInstance", JoinRoomModalController]);
    });

    describe("RoomModal", () => {
        let $scope;
        let modalInstanceMock;
        let createController: () => JoinRoomModalController;

        beforeEach(angular.mock.module("app"));
        beforeEach(angular.mock.inject(function ($rootScope, $controller) {
            $scope = $rootScope.$new();
            modalInstanceMock = (() => {
                return {
                    close: function (result) { },
                    dismiss: function () { },
                    result: {
                        then: function () { }
                    }
                }
            })();
            createController = () => {
                return $controller("joinModalController", {
                    $scope: $scope,
                    $uibModalInstance: modalInstanceMock
                });
            };
        }));

        describe("go", () => {
            it("should call close method with the room id passed", () => {
                // arrange
                $scope.roomId = "1234";
                spyOn(modalInstanceMock, "close");
                let controller = createController();

                // act
                controller.go();

                // assert
                expect(modalInstanceMock.close).toHaveBeenCalledWith("1234");
            });

            it("should get result", () => {
                // arrange
                let roomId = "1234";
                modalInstanceMock = (() => {
                    let resolve, reject;
                    let promise = new Promise((res, rej) => {
                        resolve = res;
                        reject = rej;
                    });

                    return {
                        close: function (result) { resolve(result); },
                        dismiss: function (result) { resolve(result); },
                        result: promise
                    }
                })();
                $scope.roomId = roomId;
                spyOn($scope, "$emit").and.callThrough();
                let controller = createController();

                $scope.$on("modal-join-result", (event, value) => {
                    // assert
                    expect(value).toBe(roomId);
                });

                // act
                controller.go();
            });
        });

        describe("cance", () => {
            it("should call dismiss method passing cancel", () => {
                // arrange
                spyOn(modalInstanceMock, "dismiss");
                let controller = createController();

                // act
                controller.cancel();

                // assert
                expect(modalInstanceMock.dismiss).toHaveBeenCalledWith("cancel");
            });

            it("should get dismiss result", () => {
                // arrange
                let roomId = "1234";
                modalInstanceMock = (() => {
                    let resolve, reject;
                    let promise = new Promise((res, rej) => {
                        resolve = res;
                        reject = rej;
                    });

                    return {
                        close: function (result) { resolve(result); },
                        dismiss: function (result) { reject(result); },
                        result: promise
                    }
                })();
                $scope.roomId = roomId;
                spyOn($scope, "$emit").and.callThrough();
                let controller = createController();

                $scope.$on("modal-join-result", (event, value) => {
                    // assert
                    expect(value).toBe("cancel");
                });

                // act
                controller.cancel();
            });
        });
    });
});