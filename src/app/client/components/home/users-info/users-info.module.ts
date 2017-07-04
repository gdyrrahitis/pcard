import * as angular from "angular";

import { UsersInfoComponent } from "./users-info.component";
import { SharedModule } from "../../../shared/shared.module";

export const UsersInfoModule = angular
    .module("pcard.users.info", [SharedModule])
    .component("pcardUsersInfo", UsersInfoComponent)
    .name;