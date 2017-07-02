import * as angular from "angular";

import { SharedModule } from "../shared.module";
import { TrustedFilter } from "./trusted.filter";

describe("Filters", () => {
    describe("TrustedFilter", () => {
        let url: string = "https://ghbtns.com/github-btn.html?user=gdyrrahitis&type=follow&count=true&size=large";
        let filter: ITrustedFilter;
        let $compile: ng.ICompileService;
        let $rootScope: ng.IRootScopeService;
        
        beforeEach(angular.mock.module(SharedModule));
        beforeEach(inject((_$filter_, _$compile_, _$rootScope_) => {
            filter = _$filter_("trusted");
            $compile = _$compile_;
            $rootScope = _$rootScope_;
        }));

        it("should return the url value", () => {
            let result = filter(url);
            expect(result == url).toBe(true);
        });

        it("should render the url value on element", () => {
            // arrange
            $rootScope.url = url;
            let element = angular.element("<div><iframe ng-src='{{url | trusted}}'></iframe></div>");

            // act
            let template = $compile(element)($rootScope);
            $rootScope.$digest();

            // assert
            expect(template.find("iframe").attr("ng-src")).toBe(url);
        });
    });
});