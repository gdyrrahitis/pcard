import * as angular from "angular";
import "angular-ui-router";

import { HelpComponent } from "./help.component";

function route($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) {
    $stateProvider.state("help", {
        url: "/help",
        component: "pcardHelp"
    });
    $urlRouterProvider.otherwise("/home");
}
route.$inject = ["$stateProvider", "$urlRouterProvider"];

export const HelpModule = angular
    .module("pcard.help", ["ui.router"])
    .component("pcardHelp", HelpComponent)
    .config(route)
    .name;