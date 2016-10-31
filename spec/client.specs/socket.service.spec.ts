import { SocketService } from "../../src/socket.service/socket.service";
var config: ClientAppConfig.ClientConfiguration = require("../../src/client.config.json");
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

    describe("SocketService spec", () => {
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
            // Assert
            expect(service).toBeDefined();
        });

        it("should return socket id", () => {
            // Arrange
            let expected = "123";

            // Act
            let id = service.socketId;

            // Assert
            expect(id).not.toBeUndefined();
            expect(id).toBe(expected);
        });

        it("should call the on method on socket", () => {
            // Arrange
            let eventName = "custom event";
            let callback = () => { };

            // Act
            service.on(eventName, callback);

            // Assert
            expect(mock.socketClient.on).toHaveBeenCalled();
        });

        it("should call the emit method on socket", () => {
            // Arrange
            let eventName = "custom event";

            // Act
            service.emit(eventName);

            // Assert
            expect(mock.socketClient.emit).toHaveBeenCalled();
            expect(mock.socketClient.emit.calls.count()).toBe(1);
        });

        it("should call the emit method on socket with additional data", () => {
            // Arrange
            let eventName = "custom event";
            let data = { custom: "data" };

            // Act
            service.emit(eventName, data);

            // Assert
            expect(mock.socketClient.emit).toHaveBeenCalled();
            expect(mock.socketClient.emit.calls.count()).toBe(1);
        });

        it("should call the emit method on socket with additional data and callback function", () => {
            // Arrange
            let eventName = "custom event";
            let data = { custom: "data" };
            let spy = jasmine.createSpy("callback");

            // Act
            service.emit(eventName, data, spy);

            // Assert
            expect(mock.socketClient.emit).toHaveBeenCalled();
            expect(mock.socketClient.emit.calls.count()).toBe(1);
            expect(spy).toHaveBeenCalled();
        });
    });
});