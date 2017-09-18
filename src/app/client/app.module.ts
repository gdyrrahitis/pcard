import * as angular from "angular";
import * as toast from "toastr";
import * as io from "socket.io-client";
import "ngstorage";
import "angular-sanitize";
import "angular-ui-router";

import {
    CommonModule, 
    HelpModule,
    ComponentModule,
    SharedModule,
    AppComponent, 
    runner, routerConfig
} from "./index";

export const AppModule = angular.module("pcard", [
    "ui.bootstrap",
    "ngSanitize",
    "ngStorage",
    "ui.router",
    CommonModule,
    ComponentModule,
    SharedModule,
    HelpModule
]).component("pcardApp", AppComponent)
    .config(routerConfig)
    .run(runner).name;