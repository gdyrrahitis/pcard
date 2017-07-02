import * as angular from "angular";

import { MenuModule } from "./menu/menu.module";
import { HeaderComponent } from "./header.component";

export const HeaderModule = angular
    .module("pcard.header", [MenuModule])
    .component("pcardHeader", HeaderComponent)
    .name;