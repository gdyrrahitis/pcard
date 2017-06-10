import * as angular from "angular";
import { ModalService } from "../../services/index";
import { JoinRoomModalController } from "./join.room.modal.controller";

describe("Controller", () => {
    beforeEach(() => {
        angular.module("app", ["ui.bootstrap"]);
    });

    describe("RoomModal", () => {
        let $scope;
        let modalInstanceMock;

        beforeEach(angular.mock.module("app"));
        beforeEach(angular.mock.inject(function ($rootScope) {
            $scope = $rootScope.$new();
        }));
        beforeEach(() => {
            modalInstanceMock = {
                close: function () { },
                dismiss: function () { },
                result: {
                    then: function() {}
                }
            };
        });

        describe("go", () => {
            it("should call close method with the room id passed", () => {
                // arrange
                $scope.roomId = "1234";
                spyOn(modalInstanceMock, "close");
                let controller = new JoinRoomModalController($scope, <any>modalInstanceMock);

                // act
                controller.go();

                // assert
                expect(modalInstanceMock.close).toHaveBeenCalledWith("1234")
            });
        });

        describe("cance", () => {
            it("should call dismiss method passing cancel", () => {
                // arrange
                spyOn(modalInstanceMock, "dismiss");
                let controller = new JoinRoomModalController($scope, <any>modalInstanceMock);

                // act
                controller.cancel();

                // assert
                expect(modalInstanceMock.dismiss).toHaveBeenCalledWith("cancel");
            });
        });
    });
});