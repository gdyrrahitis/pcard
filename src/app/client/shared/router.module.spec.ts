// import * as angular from "angular";

// import { RouterModule } from "../modules/router.module";

// describe("Modules", () => {
//     describe("RouterModule", () => {
//         let $route: ng.route.IRouteService;
//         let $rootScope: ng.IRootScopeService;
//         let $location: ng.ILocationService;

//         // beforeEach(angular.mock.module(RouterModule));
//         beforeEach(inject((_$route_, _$rootScope_, _$location_) => {
//             $route = _$route_;
//             $rootScope = _$rootScope_;
//             $location = _$location_;
//         }));

//         it("should define home template for '/' route", () => {
//             expect($route.routes["/"].template).toBe("<pcard-home></pcard-home>");
//         });

//         it("should define room template for '/room:id' route", () => {
//             expect($route.routes["/room/:id"].template).toBe("<pcard-room></pcard-room>");
//         });

//         it("should navigate to home and load home component when navigating '/'", () => {
//             $location.path("/");

//             $rootScope.$digest();
//             expect($route.current.template).toBe("<pcard-home></pcard-home>");
//             expect($route.current["originalPath"]).toBe("/");
//         });

//         it("should navigate to room and load room component when navigating to '/room/:id'", () => {
//             $location.path("/room/1234");

//             $rootScope.$digest();
//             expect($route.current.template).toBe("<pcard-room></pcard-room>");
//             expect($route.current["originalPath"]).toBe("/room/:id");
//         });

//         it("should redirect to home and load home component when the route is not found", () => {
//             $location.path("/non-existent");

//             $rootScope.$digest();
//             expect($route.current.template).toBe("<pcard-home></pcard-home>");
//             expect($route.current["originalPath"]).toBe("/");
//         });
//     });
// });