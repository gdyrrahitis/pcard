// import * as angular from "angular";
// import { ModalService } from "../../services/index";
// import { ModalComponent } from "./modal.component";

// xdescribe("Service", () => {
//     describe("modal.service", () => {
//         describe("open", () => {
//             it("should call ui.boostrap.modal open method with options", () => {
//                 // arrange
//                 let modalMock = jasmine.createSpyObj("uiModal", ["open"]);
//                 let service = new ModalService(modalMock);
//                 let options = { controller: "myController", templateUrl: "./myTemplate.html" };

//                 // act
//                 service.open(options);

//                 // act
//                 expect(modalMock.open).toHaveBeenCalledWith(options);
//             });
//         });

//         describe("dismiss", () => {
//             it("should not call dismiss when modalInstance is not set", () => {
//                 // arrange
//                 let uiModalMock = jasmine.createSpyObj("uiModal", ["open"]);
//                 let service = new ModalService(<any>uiModalMock);

//                 // act | assert
//                 expect(() => service.dismiss()).not.toThrowError();
//             });

//             it("should call dismiss when modalInstance is set", () => {
//                 // arrange
//                 let uiModalMock = {
//                     open: function () { }
//                 };
//                 let modalInstanceMock = jasmine.createSpyObj("modalInstance", ["dismiss"]);
//                 spyOn(uiModalMock, "open").and.returnValue(modalInstanceMock);
//                 let service = new ModalService(<any>uiModalMock);
//                 let options = { controller: "myController", templateUrl: "./myTemplate.html" };
//                 service.open(options);

//                 // act
//                 service.dismiss();

//                 // assert
//                 expect(modalInstanceMock.dismiss).toHaveBeenCalled();
//             });
//         });

//         describe("close", () => {
//             it("should not call close when modalInstance is not set", () => {
//                 // arrange
//                 let uiModalMock = jasmine.createSpyObj("uiModal", ["open"]);
//                 let service = new ModalService(<any>uiModalMock);

//                 // act | assert
//                 expect(() => service.close()).not.toThrowError();
//             });

//             it("should call close when modalInstance is set", () => {
//                 // arrange
//                 let uiModalMock = {
//                     open: function () { }
//                 };
//                 let modalInstanceMock = jasmine.createSpyObj("modalInstance", ["close"]);
//                 spyOn(uiModalMock, "open").and.returnValue(modalInstanceMock);
//                 let service = new ModalService(<any>uiModalMock);
//                 let options = { controller: "myController", templateUrl: "./myTemplate.html" };
//                 service.open(options);

//                 // act
//                 service.close();

//                 // assert
//                 expect(modalInstanceMock.close).toHaveBeenCalled();
//             });
//         });
//     });
// });

// xdescribe("Controller", () => {
//     beforeEach(() => {
//         angular.module("app", ["ui.bootstrap"])
//             .controller("joinModalController", ["$scope", "$uibModalInstance", ModalComponent]);
//     });

//     describe("RoomModal", () => {
//         let $scope;
//         let modalInstanceMock;
//         let createController: () => ModalComponent;

//         beforeEach(angular.mock.module("app"));
//         beforeEach(angular.mock.inject(function ($rootScope, $controller) {
//             $scope = $rootScope.$new();
//             modalInstanceMock = (() => {
//                 return {
//                     close: function (result) { },
//                     dismiss: function () { },
//                     result: {
//                         then: function () { }
//                     }
//                 }
//             })();
//             createController = () => {
//                 return $controller("joinModalController", {
//                     $scope: $scope,
//                     $uibModalInstance: modalInstanceMock
//                 });
//             };
//         }));

//         describe("go", () => {
//             it("should call close method with the room id passed", () => {
//                 // arrange
//                 $scope.roomId = "1234";
//                 spyOn(modalInstanceMock, "close");
//                 let controller = createController();

//                 // act
//                 controller.go();

//                 // assert
//                 expect(modalInstanceMock.close).toHaveBeenCalledWith("1234");
//             });

//             it("should get result", () => {
//                 // arrange
//                 let roomId = "1234";
//                 modalInstanceMock = (() => {
//                     let resolve, reject;
//                     let promise = new Promise((res, rej) => {
//                         resolve = res;
//                         reject = rej;
//                     });

//                     return {
//                         close: function (result) { resolve(result); },
//                         dismiss: function (result) { resolve(result); },
//                         result: promise
//                     }
//                 })();
//                 $scope.roomId = roomId;
//                 spyOn($scope, "$emit").and.callThrough();
//                 let controller = createController();

//                 $scope.$on("modal-join-result", (event, value) => {
//                     // assert
//                     expect(value).toBe(roomId);
//                 });

//                 // act
//                 controller.go();
//             });
//         });

//         describe("cance", () => {
//             it("should call dismiss method passing cancel", () => {
//                 // arrange
//                 spyOn(modalInstanceMock, "dismiss");
//                 let controller = createController();

//                 // act
//                 controller.cancel();

//                 // assert
//                 expect(modalInstanceMock.dismiss).toHaveBeenCalledWith("cancel");
//             });

//             it("should get dismiss result", () => {
//                 // arrange
//                 let roomId = "1234";
//                 modalInstanceMock = (() => {
//                     let resolve, reject;
//                     let promise = new Promise((res, rej) => {
//                         resolve = res;
//                         reject = rej;
//                     });

//                     return {
//                         close: function (result) { resolve(result); },
//                         dismiss: function (result) { reject(result); },
//                         result: promise
//                     }
//                 })();
//                 $scope.roomId = roomId;
//                 spyOn($scope, "$emit").and.callThrough();
//                 let controller = createController();

//                 $scope.$on("modal-join-result", (event, value) => {
//                     // assert
//                     expect(value).toBe("cancel");
//                 });

//                 // act
//                 controller.cancel();
//             });
//         });
//     });
// });