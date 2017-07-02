import { browser, element, by } from "protractor";

describe("e2e", () => {
    describe("Controller", () => {
        describe("Home", () => {
            it("should have a title", () => {
                browser.get("http://localhost:4000/");
                expect(<any>browser.getTitle()).toBe("Agile poker planning");
            });
        });
    });
});