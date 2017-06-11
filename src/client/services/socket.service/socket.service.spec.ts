import * as angular from "angular";
import { SocketService } from "./socket.service";
var socketMock = require("socket-io-mock");

describe("Services", () => {
    let mock;

    beforeEach(() => {
        mock = new socketMock();
        mock.socketClient.id = "123";

        angular.module("app", ["ngSanitize", "ngRoute", "ngStorage"])
            .value("socket", mock.socketClient)
            .factory("socketService", ["$rootScope", "socket", ($rootScope, socket) => {
                return new SocketService($rootScope, socket);
            }]);
    });

    xdescribe("Socket", () => {
        let $scope;
        let service: SocketService;
        beforeEach(angular.mock.module("app"));
        beforeEach(() => {
            spyOn(mock.socketClient, "on").and.callThrough();
            spyOn(mock.socketClient, "emit").and.callThrough();
        });
        beforeEach(angular.mock.inject(function ($rootScope, _socketService_) {
            $scope = <IHomeControllerScope>$rootScope.$new();
            service = _socketService_;
        }));

        it("should have socket service defined", () => {
            // assert
            expect(service).toBeDefined();
        });

        it("should return socket id", () => {
            // arrange
            let expected = "123";

            // act
            let id = service.socketId;

            // assert
            expect(id).not.toBeUndefined();
            expect(id).toBe(expected);
        });

        it("should call the on method on socket", () => {
            // arrange
            let eventName = "custom event";
            let callback = () => { };

            // act
            service.on(eventName, callback);

            // assert
            expect(mock.socketClient.on).toHaveBeenCalled();
        });

        it("should call the emit method on socket", () => {
            // arrange
            let eventName = "custom event";

            // act
            service.emit(eventName);

            // assert
            expect(mock.socketClient.emit).toHaveBeenCalled();
            expect(mock.socketClient.emit.calls.count()).toBe(1);
        });

        it("should call the emit method on socket with additional data", () => {
            // arrange
            let eventName = "custom event";
            let data = { custom: "data" };

            // act
            service.emit(eventName, data);

            // assert
            expect(mock.socketClient.emit).toHaveBeenCalled();
            expect(mock.socketClient.emit.calls.count()).toBe(1);
        });

        it("should call the emit method on socket with additional data and callback function", () => {
            // arrange
            let eventName = "custom event";
            let data = { custom: "data" };
            let spy = jasmine.createSpy("callback");

            // act
            service.emit(eventName, data, spy);

            // assert
            expect(mock.socketClient.emit).toHaveBeenCalled();
            expect(mock.socketClient.emit.calls.count()).toBe(1);
            expect(spy).toHaveBeenCalled();
        });
    });
});