import * as angular from "angular";

import { FooterModule, FooterComponent } from "./index";

declare type Locals = { $scope?: ng.IScope, [key: string]: any };
describe("Footer", () => {
    let createComponent: (name: string, locals: Locals, bindings: {}) => IFooterComponent;

    beforeEach(angular.mock.module(FooterModule));
    beforeEach(angular.mock.module("./footer.html"));
    beforeEach(angular.mock.module(function ($provide) {

        // monkey-patches $templateCache to have a keys() method\
        $provide.decorator('$templateCache', [
            '$delegate', function ($delegate) {

                var keys = [], origPut = $delegate.put;

                $delegate.put = function (key, value) {
                    origPut(key, value);
                    keys.push(key);
                };

                // we would need cache.peek() to get all keys from $templateCache, but this features was never
                // integrated into Angular: https://github.com/angular/angular.js/pull/3760
                // please note: this is not feature complete, removing templates is NOT considered
                $delegate.getKeys = function () {
                    return keys;
                };

                return $delegate;
            }
        ])
    }));

    beforeEach(inject((_$componentController_: ng.IComponentControllerService) => {
        createComponent = (name: string, locals: Locals, bindings: {}) => <IFooterComponent>_$componentController_(name, locals, bindings);
    }));

    describe("Component", () => {
        let githubUrl: string = "https://ghbtns.com/github-btn.html?user=gdyrrahitis&type=follow&count=true&size=large";
        let twitterUrl: string = "https://twitter.com/giorgosdyrra";
        let freePikUrl: string = "http://www.freepik.com";
        let flatIconsUrl: string = "http://www.flaticon.com";
        let creativeCommonsUrl: string = "http://creativecommons.org/licenses/by/3.0/";

        it("should have urls set", () => {
            let component = createComponent("pcardFooter", null, {});
            expect(component.githubUrl).toBe(githubUrl);
            expect(component.twitterUrl).toBe(twitterUrl);
            expect(component.freePikUrl).toBe(freePikUrl);
            expect(component.flatIconsUrl).toBe(flatIconsUrl);
            expect(component.creativeCommonsUrl).toBe(creativeCommonsUrl);
        });

        describe("Template", () => {
            let $compile: ng.ICompileService;
            let $rootScope: ng.IRootScopeService;
            let $templateCache: ng.ITemplateCacheService;

            beforeEach(inject((_$compile_, _$rootScope_, _$templateCache_) => {
                $compile = _$compile_;
                $rootScope = _$rootScope_;
                $templateCache = _$templateCache_;
            }));

            it("should replace element with appropriate content", () => {
                let $scope: ng.IScope = $rootScope.$new();
                let template = $compile("<pcard-footer></pcard-footer>")($scope);

                $scope.$digest();

                let iframe = template.find("iframe");
                expect(iframe.attr("ng-src")).toBe(githubUrl);

                let anchor = angular.element(template[0].querySelector("a.twitter-follow-button"));
                expect(anchor.attr("ng-href")).toBe(twitterUrl);

                let freePik = angular.element(template[0].querySelector("a[title='Freepik']"));
                expect(freePik.attr("ng-href")).toBe(freePikUrl);

                let flatIcons = angular.element(template[0].querySelector("a[title='Flaticon']"));
                expect(flatIcons.attr("ng-href")).toBe(flatIconsUrl);

                let creativeCommons = angular.element(template[0].querySelector("a[title='Creative Commons BY 3.0']"));
                expect(creativeCommons.attr("ng-href")).toBe(creativeCommonsUrl);
            });
        });
    });
    describe("Module", () => {
        it("should have a footer component", () => {
            let component = createComponent("pcardFooter", null, {});
            expect(component).toBeDefined();
        });

        it("should resolve the trustedFilter", () => {
            inject(($filter) => {
                let trusted = $filter("trusted");
                expect(trusted).toBeDefined();
            });
        });
    });
});