import * as angular from "angular";

import { SharedModule } from "../../shared.module";
import { SocketService } from "./socket.service";
var mock = require("socket-io-mock");

describe("Services", () => {
    describe("Socket", () => {
        let socketMock;
        let $scope;
        let service: SocketService;
        let socketId: string = "1234";
        
        beforeEach(angular.mock.module(SharedModule));
        beforeEach(() => {
            socketMock = new mock();
            socketMock.id = socketId;
            spyOn(socketMock, "on").and.callThrough();
            spyOn(socketMock, "emit").and.callThrough();
        });
        beforeEach(angular.mock.module(($provide) => {
            $provide.decorator("socket", ["$delegate", ($delegate) => {
                return socketMock;
            }]);
        }));
        beforeEach(angular.mock.inject(function (_socketService_) {
            service = _socketService_;
        }));

        it("should have socket service defined", () => {
            // assert
            expect(service).toBeDefined();
        });

        describe("socketId", () => {
            it("should return socket id", () => {
                let id = service.socketId;
                expect(id).not.toBeUndefined();
                expect(id).toBe(socketId);
            });
        });

        describe("on", () => {
            it("should call the on method on socket", () => {
                // arrange
                let eventName = "custom event";
                let callback = () => { };

                // act
                service.on(eventName, callback);

                // assert
                expect(socketMock.on).toHaveBeenCalled();
            });
        });

        describe("emit", () => {
            it("should call the emit method on socket", () => {
                // arrange
                let eventName = "custom event";

                // act
                service.emit(eventName);

                // assert
                expect(socketMock.emit).toHaveBeenCalled();
                expect(socketMock.emit.calls.count()).toBe(1);
            });

            it("should call the emit method on socket with additional data", () => {
                // arrange
                let eventName = "custom event";
                let data = { custom: "data" };

                // act
                service.emit(eventName, data);

                // assert
                expect(socketMock.emit).toHaveBeenCalled();
                expect(socketMock.emit.calls.count()).toBe(1);
            });

            it("should call the emit method on socket with additional data and callback function", () => {
                // arrange
                let eventName = "custom event";
                let data = { custom: "data" };

                // act
                service.emit(eventName, data, () => {});

                // assert
                expect(socketMock.emit).toHaveBeenCalled();
                expect(socketMock.emit.calls.count()).toBe(1);
            });
        });
    });
});