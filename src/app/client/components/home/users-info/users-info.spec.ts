import * as angular from "angular";

import { UsersInfoModule } from "./users-info.module";

declare module "angular" {
    export interface IRootScopeService {
        users: number;
    }
}

describe("UsersInfo", () => {
    let createComponent: (name: string, locals: any, bindings: any) => IUsersInfoComponent;
    let $compile: ng.ICompileService;
    let $rootScope: ng.IRootScopeService;
    let users = 10;

    beforeEach(angular.mock.module(UsersInfoModule));
    beforeEach(angular.mock.module("./users-info.html"));

    beforeEach(inject((_$componentController_, _$compile_: ng.ICompileService, _$rootScope_: ng.IRootScopeService) => {
        createComponent = (name: string, locals: any, bindings: any) => _$componentController_(name, locals, bindings);
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    describe("Component", () => {
        it("should set users", () => {
            let component = createComponent("pcardUsersInfo", null, { users: users });
            expect(component.users).toBe(users);
        });

        it("should render users in template", () => {
            // arrange
            let element = angular.element("<pcard-users-info users='users'></pcard-users-info>");
            let template = $compile(element)($rootScope);
            $rootScope.users = users;
            $rootScope.$digest();

            // act
            let usersElement = angular.element(template[0].querySelector("span.users"));
            let pluralUsersElement = angular.element(template[0].querySelector("span.users-plural"));

            // assert
            expect(usersElement.text()).toBe("10");
            expect(pluralUsersElement.text()).toBe("users");
        });

        it("should render singular for one user", () => {
            // arrange
            let element = angular.element("<pcard-users-info users='users'></pcard-users-info>");
            let template = $compile(element)($rootScope);
            $rootScope.users = 1;
            $rootScope.$digest();

            // act
            let usersElement = angular.element(template[0].querySelector("span.users"));
            let pluralUsersElement = angular.element(template[0].querySelector("span.users-plural"));

            // assert
            expect(usersElement.text()).toBe("1");
            expect(pluralUsersElement.text()).toBe("user");
        });

        it("should show nothing for no users", () => {
            // arrange
            let element = angular.element("<pcard-users-info users='users'></pcard-users-info>");
            let template = $compile(element)($rootScope);
            $rootScope.users = 0;
            $rootScope.$digest();

            // act
            let root = template.find("div");

            // assert
            expect(root.hasClass("ng-hide")).toBeTruthy();
        });
    });

    describe("Module", () => {
        it("should resolve users info component", () => {
            let component = createComponent("pcardUsersInfo", null, { users: users });
            expect(component).toBeDefined();
        });
    });
});