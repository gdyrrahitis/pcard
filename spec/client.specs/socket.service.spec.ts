import { SocketService } from "../../src/socket.service/socket.service";
describe("Services", () => {
    beforeEach(() => {
        angular.module("app", ["ngSanitize", "ngRoute", "ngStorage"])
            .factory("socketService", ["$rootScope", ($rootScope) => {
                return new SocketService($rootScope);
            }]);
    });

    describe("SocketService spec", () => {
        let $scope;
        let service: SocketService;
        beforeEach(angular.mock.module("app"));
        beforeEach(angular.mock.inject(function ($rootScope, _socketService_) {
            $scope = <IHomeControllerScope>$rootScope.$new();
            service = _socketService_;
        }));

        it("should have socket service defined", () => {
            // Assert
            expect(service).toBeDefined();
        });
    });
});