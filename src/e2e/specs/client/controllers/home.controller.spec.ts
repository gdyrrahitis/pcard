import { browser, element, by } from "protractor";
describe("e2e", () => {
    describe("Controller", () => {
        describe("Home", () => {
            it("should have a title", () => {
                browser.get("http://localhost:8000/");
                let v: any = element(by.tagName("title")).getText();

                expect(v).toBe("Scrum poker planning")
            });
        });
    });
});