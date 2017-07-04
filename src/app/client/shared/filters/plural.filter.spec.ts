import * as angular from "angular";		
import { PluralFilter } from "./plural.filter";		
		
describe("Filter", () => {		
    beforeEach(() => {		
        angular.module("app", [])		
            .filter("plural", PluralFilter);		
    });		
		
    describe("PluralFilter", () => {		
        let filter: IPluralFilter;		
		
        beforeEach(angular.mock.module("app"));		
        beforeEach(inject(($injector) => {		
            filter = $injector.get("$filter")("plural");		
        }));		
		
        it("should return plural 'users' for zero input", () => {		
            // act		
            let result = filter("user", "users", 0);		
		
            // expect		
            expect(result).toBe("users");		
        });		
		
        it("should return null minus for count", () => {		
            // act		
            let result = filter("user", "users", -1);		
		
            // expect		
            expect(result).toBeNull();		
        });		
		
        it("should return singular 'user' for single input", () => {		
            // act		
            let result = filter("user", "users", 1);		
		
            // expect		
            expect(result).toBe("user");		
        });		
		
        it("should return plural 'users' for greater than one count", () => {		
            // act		
            let result = filter("user", "users", 5);		
		
            // expect		
            expect(result).toBe("users");		
        });		
    });		
}); 