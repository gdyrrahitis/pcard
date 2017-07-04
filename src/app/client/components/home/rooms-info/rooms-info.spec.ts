import * as angular from "angular";

import { RoomsInfoModule } from "./rooms-info.module";

describe("RoomsInfo", () => {
    let createComponent: (name: string, locals: any, bindings: any) => IRoomsInfoComponent;
    let $compile: ng.ICompileService;
    let $rootScope: ng.IRootScopeService;
    let rooms = 10;
    let totalRooms = 100;

    beforeEach(angular.mock.module(RoomsInfoModule));
    beforeEach(angular.mock.module("./rooms-info.html"));

    beforeEach(inject((_$componentController_, _$compile_: ng.ICompileService, _$rootScope_: ng.IRootScopeService) => {
        createComponent = (name: string, locals: any, bindings: any) => _$componentController_(name, locals, bindings);
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    describe("Component", () => {
        it("should set rooms and totalRooms", () => {
            let component = createComponent("pcardRoomsInfo", null, { rooms: rooms, totalRooms: totalRooms });
            expect(component.rooms).toBe(rooms);
            expect(component.totalRooms).toBe(totalRooms);
        });

        it("should render rooms and total rooms in template", () => {
            // arrange
            let element = angular.element("<pcard-rooms-info rooms='rooms' total-rooms='totalRooms'></pcard-rooms-info>");
            let template = $compile(element)($rootScope);
            $rootScope.rooms = rooms;
            $rootScope.totalRooms = totalRooms;
            $rootScope.$digest();

            // act
            let roomsElement = angular.element(template[0].querySelector("span.rooms"));
            let pluralRoomsElement = angular.element(template[0].querySelector("span.rooms-plural"));
            let totalRoomsElement = template.find("i");

            // assert
            expect(roomsElement.text()).toBe("10");
            expect(pluralRoomsElement.text()).toBe("rooms");
            expect(totalRoomsElement.text()).toBe("10 / 100");
        });

        it("should render singular for one room", () => {
            // arrange
            let element = angular.element("<pcard-rooms-info rooms='rooms' total-rooms='totalRooms'></pcard-rooms-info>");
            let template = $compile(element)($rootScope);
            $rootScope.rooms = 1;
            $rootScope.totalRooms = totalRooms;
            $rootScope.$digest();

            // act
            let roomsElement = angular.element(template[0].querySelector("span.rooms"));
            let pluralRoomsElement = angular.element(template[0].querySelector("span.rooms-plural"));
            let totalRoomsElement = template.find("i");

            // assert
            expect(roomsElement.text()).toBe("1");
            expect(pluralRoomsElement.text()).toBe("room");
            expect(totalRoomsElement.text()).toBe("1 / 100");
        });

        it("should show nothing for no rooms", () => {
            // arrange
            let element = angular.element("<pcard-rooms-info rooms='rooms' total-rooms='totalRooms'></pcard-rooms-info>");
            let template = $compile(element)($rootScope);
            $rootScope.rooms = 0;
            $rootScope.totalRooms = totalRooms;
            $rootScope.$digest();

            // act
            let root = template.find("div");

            // assert
            expect(root.hasClass("ng-hide")).toBeTruthy();
        });

        it("should show nothing for no totalRooms", () => {
            // arrange
            let element = angular.element("<pcard-rooms-info rooms='rooms' total-rooms='totalRooms'></pcard-rooms-info>");
            let template = $compile(element)($rootScope);
            $rootScope.rooms = 10;
            $rootScope.totalRooms = 0;
            $rootScope.$digest();

            // act
            let root = template.find("div");

            // assert
            expect(root.hasClass("ng-hide")).toBeTruthy();
        });
    });

    describe("Module", () => {
        it("should resolve rooms info component", () => {
            let component = createComponent("pcardRoomsInfo", null, { rooms: rooms, totalRooms: totalRooms });
            expect(component).toBeDefined();
        });
    });
});