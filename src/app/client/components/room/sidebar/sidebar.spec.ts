import * as angular from "angular";

import { SidebarComponent } from "./sidebar.component";
import { SidebarModule } from "./sidebar.module";

describe("Sidebar", () => {
    let createComponent: (name: string, locals?: any, bindings?: any) => ISidebarComponent;

    beforeEach(angular.mock.module("./sidebar.html"));
    beforeEach(angular.mock.module(SidebarModule));
    beforeEach(inject((_$componentController_) => {
        createComponent = (name: string, locals: any = null, bindings: any = {}) => _$componentController_(name, locals, bindings);
    }));

    describe("Component", () => {
        let $compile: ng.ICompileService;
        let $rootScope: ng.IRootScopeService;
        let scope: ng.IScope;

        beforeEach(inject((_$compile_, _$rootScope_) => {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
        }));

        describe("isolated", () => {
            it("should have by default for all buttons show property to false except planning-start", () => {
                // arrange
                let component = createComponent("pcardSidebar");

                // act
                let buttons: Button[] = component.buttons;

                // assert
                expect(buttons.filter(b => b.show === false).length).toBe(5);
                expect(buttons.filter(b => b.show === true).length).toBe(1);
            });

            describe("startPlanning", () => {
                it("should turn show property to false for planning-start and to true for others except planning-unlock and planning-show", () => {
                    // arrange
                    let component = createComponent("pcardSidebar");

                    // act
                    component.startPlanning();
                    let buttons: Button[] = component.buttons;

                    // assert
                    expect(buttons.find(b => b.id === "planning-start").show).toBe(false, "planning-start");
                    expect(buttons.find(b => b.id === "planning-reset").show).toBe(true, "planning-reset");
                    expect(buttons.find(b => b.id === "planning-stop").show).toBe(true, "planning-stop");
                    expect(buttons.find(b => b.id === "planning-lock").show).toBe(false, "planning-lock");
                    expect(buttons.find(b => b.id === "planning-unlock").show).toBe(false, "planning-unlock");
                    expect(buttons.find(b => b.id === "planning-show").show).toBe(false, "planning-show");
                    expect(buttons.find(b => b.id === "planning-show").active).toBe(false, "planning-show");
                });
            });

            describe("resetPlanning", () => {
                it("should not call resetPlanning when plannng-start is showing", () => {
                    // arrange
                    let component = createComponent("pcardSidebar");

                    // act
                    component.resetPlanning();
                    let buttons: Button[] = component.buttons;

                    // assert
                    expect(buttons.filter(b => b.show === false).length).toBe(5);
                    expect(buttons.filter(b => b.show === true).length).toBe(1);
                });

                it("should not affect buttons state when resetPlanning is called", () => {
                    // arrange
                    let component = createComponent("pcardSidebar");
                    component.startPlanning();

                    // act
                    component.resetPlanning();
                    let buttons: Button[] = component.buttons;

                    // assert
                    expect(buttons.find(b => b.id === "planning-start").show).toBe(false, "planning-start");
                    expect(buttons.find(b => b.id === "planning-reset").show).toBe(true, "planning-reset");
                    expect(buttons.find(b => b.id === "planning-stop").show).toBe(true, "planning-stop");
                    expect(buttons.find(b => b.id === "planning-lock").show).toBe(false, "planning-lock");
                    expect(buttons.find(b => b.id === "planning-unlock").show).toBe(false, "planning-unlock");
                    expect(buttons.find(b => b.id === "planning-show").show).toBe(false, "planning-show");
                    expect(buttons.find(b => b.id === "planning-show").active).toBe(false, "planning-show");
                });
            });

            describe("stopPlanning", () => {
                it("should not call stopPlanning when plannng-start is showing", () => {
                    // arrange
                    let component = createComponent("pcardSidebar");

                    // act
                    component.stopPlanning();
                    let buttons: Button[] = component.buttons;

                    // assert
                    expect(buttons.filter(b => b.show === false).length).toBe(5);
                    expect(buttons.filter(b => b.show === true).length).toBe(1);
                });

                it("should set show for planning-start, reset to true and false for stop, lock, unlock, show", () => {
                    // arrange
                    let component = createComponent("pcardSidebar");
                    component.startPlanning();

                    // act
                    component.stopPlanning();
                    let buttons: Button[] = component.buttons;

                    // assert
                    expect(buttons.filter(b => b.show === false).length).toBe(4);
                    expect(buttons.filter(b => b.show === true).length).toBe(2);
                    expect(buttons.find(b => b.id === "planning-start").show).toBe(true, "planning-start");
                    expect(buttons.find(b => b.id === "planning-reset").show).toBe(true, "planning-reset");
                    expect(buttons.find(b => b.id === "planning-stop").show).toBe(false, "planning-stop");
                    expect(buttons.find(b => b.id === "planning-lock").show).toBe(false, "planning-lock");
                    expect(buttons.find(b => b.id === "planning-unlock").show).toBe(false, "planning-unlock");
                    expect(buttons.find(b => b.id === "planning-show").show).toBe(false, "planning-show");
                });
            });

            describe("planningLock", () => {
                it("should not call planningLock when plannng-start is showing", () => {
                    // arrange
                    let component = createComponent("pcardSidebar");

                    // act
                    component.planningLock();
                    let buttons: Button[] = component.buttons;

                    // assert
                    expect(buttons.filter(b => b.show === false).length).toBe(5);
                    expect(buttons.filter(b => b.show === true).length).toBe(1);
                });

                it("should change show for planning-lock to false, for unlock to true and active/show for planning-show to true", () => {
                    // arrange
                    let component = createComponent("pcardSidebar");
                    component.startPlanning();

                    // act
                    component.planningLock();
                    let buttons: Button[] = component.buttons;

                    // assert
                    expect(buttons.find(b => b.id === "planning-lock").show).toBe(false, "planning-lock");
                    expect(buttons.find(b => b.id === "planning-unlock").show).toBe(true, "planning-unlock");
                    expect(buttons.find(b => b.id === "planning-show").show).toBe(true, "planning-show");
                    expect(buttons.find(b => b.id === "planning-show").active).toBe(true, "planning-show");
                });
            });

            describe("planningUnlock", () => {
                it("should not call planningUnlock before planning-start", () => {
                    // arrange
                    let component = createComponent("pcardSidebar");

                    // act
                    component.planningUnlock();
                    let buttons: Button[] = component.buttons;

                    // assert
                    expect(buttons.filter(b => b.show === false).length).toBe(5);
                    expect(buttons.filter(b => b.show === true).length).toBe(1);
                });

                it("should not call planningUnlock when plannng-lock is not showing", () => {
                    // arrange
                    let component = createComponent("pcardSidebar");
                    component.startPlanning();

                    // act
                    component.planningUnlock();
                    let buttons: Button[] = component.buttons;

                    // assert
                    expect(buttons.find(b => b.id === "planning-start").show).toBe(false, "planning-start");
                    expect(buttons.find(b => b.id === "planning-reset").show).toBe(true, "planning-reset");
                    expect(buttons.find(b => b.id === "planning-stop").show).toBe(true, "planning-stop");
                    expect(buttons.find(b => b.id === "planning-lock").show).toBe(true, "planning-lock");
                    expect(buttons.find(b => b.id === "planning-unlock").show).toBe(false, "planning-unlock");
                    expect(buttons.find(b => b.id === "planning-show").show).toBe(false, "planning-show");
                });

                it("should change show for planning-unlock to false, for lock to true and active/show for planning-show to true", () => {
                    // arrange
                    let component = createComponent("pcardSidebar");
                    component.startPlanning();
                    component.planningLock();

                    // act
                    component.planningUnlock();
                    let buttons: Button[] = component.buttons;

                    // assert
                    expect(buttons.find(b => b.id === "planning-lock").show).toBe(true, "planning-lock");
                    expect(buttons.find(b => b.id === "planning-unlock").show).toBe(false, "planning-unlock");
                    expect(buttons.find(b => b.id === "planning-show").show).toBe(true, "planning-show");
                    expect(buttons.find(b => b.id === "planning-show").active).toBe(false, "planning-show");
                });
            });

            describe("planningShow", () => {
                it("should not call planningShow before planning-start", () => {
                    // arrange
                    let component = createComponent("pcardSidebar");

                    // act
                    component.planningShow();
                    let buttons: Button[] = component.buttons;

                    // assert
                    expect(buttons.filter(b => b.show === false).length).toBe(5);
                    expect(buttons.filter(b => b.show === true).length).toBe(1);
                });

                it("should not call planningShow when plannng-lock is not showing", () => {
                    // arrange
                    let component = createComponent("pcardSidebar");
                    component.startPlanning();

                    // act
                    component.planningShow();
                    let buttons: Button[] = component.buttons;

                    // assert
                    expect(buttons.find(b => b.id === "planning-start").show).toBe(false, "planning-start");
                    expect(buttons.find(b => b.id === "planning-reset").show).toBe(true, "planning-reset");
                    expect(buttons.find(b => b.id === "planning-stop").show).toBe(true, "planning-stop");
                    expect(buttons.find(b => b.id === "planning-lock").show).toBe(true, "planning-lock");
                    expect(buttons.find(b => b.id === "planning-unlock").show).toBe(false, "planning-unlock");
                    expect(buttons.find(b => b.id === "planning-show").show).toBe(false, "planning-show");
                });

                it("should set planning-reset to true while all the others have show property set to false", () => {
                    
                });
            });
        });

        describe("integrated", () => {
            let element: JQuery;

            beforeEach(() => {
                element = angular.element("<pcard-sidebar></pcard-sidebar>");
            });

            it("should define a template", () => {
                // act
                let template = $compile(element)(scope);
                scope.$digest();

                // assert
                expect(template).toBeDefined();
                expect(template.html()).toBeDefined();
                expect(template.html()).not.toBeNull();
                expect(template.html() === "").not.toBeTruthy("Expected html to have a body");
            });

            it("should show buttons with only start planning enabled and visible at start", () => {
                // arrange
                let template = $compile(element)(scope);
                scope.$digest();

                // act
                let buttons = template.find("a");

                // assert
                expect(buttons.length).toBe(1);
            });

            xit("should hide start planning and show lock, reset, stop and show", () => {
                // 
            });
        });
    });

    describe("Module", () => {
        it("should resolve sidebar component", () => {
            let component = createComponent("pcardSidebar", null, {});
            expect(component).toBeDefined();
        });
    });
});