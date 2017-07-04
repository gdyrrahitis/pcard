import * as angular from "angular";
import "angular-ui-bootstrap";

import { SharedModule } from "../../../shared/shared.module";
import { RoomsInfoComponent } from "./rooms-info.component";

export const RoomsInfoModule = angular
    .module("pcard.rooms.info", [SharedModule, "ui.bootstrap"])
    .component("pcardRoomsInfo", RoomsInfoComponent)
    .name;