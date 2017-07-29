import * as angular from "angular";
import "angular-ui-bootstrap";

import { RoomsInfoModule } from "./rooms-info/index";
import { UsersInfoModule } from "./users-info/index";
import { HomeComponent } from "./home.component";
import { ModalModule } from "../modal/index";

export const HomeModule = angular
    .module("pcard.home", ["ui.bootstrap", RoomsInfoModule, UsersInfoModule, ModalModule])
    .component("pcardHome", HomeComponent)
    .name;