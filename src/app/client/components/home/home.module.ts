import * as angular from "angular";
import "angular-ui-bootstrap";

import { RoomsInfoModule } from "./rooms-info/index";
import { UsersInfoModule } from "./users-info/index";
import { HomeComponent } from "./home.component";

export const HomeModule = angular
    .module("pcard.home", ["ui.bootstrap", RoomsInfoModule, UsersInfoModule])
    .component("pcardHome", HomeComponent)
    .name;