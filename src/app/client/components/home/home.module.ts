import * as angular from "angular";
import "angular-ui-bootstrap";
import "angular-ui-router";

import { RoomsInfoModule } from "./rooms-info/index";
import { UsersInfoModule } from "./users-info/index";
import { HomeComponent } from "./home.component";
import { ModalModule } from "../modal/index";

function route($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) {
    $stateProvider.state("home", {
        url: "/home",
        component: "pcardHome"
    });
    $urlRouterProvider.when("/", "/home");
}
route.$inject = ["$stateProvider", "$urlRouterProvider"];

export const HomeModule = angular
    .module("pcard.home", ["ui.bootstrap", "ui.router", RoomsInfoModule, UsersInfoModule, ModalModule])
    .component("pcardHome", HomeComponent)
    .config(route)
    .name;