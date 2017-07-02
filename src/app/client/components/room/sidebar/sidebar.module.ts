import * as angular from "angular";

import { SidebarComponent } from "./sidebar.component";

export const SidebarModule = angular
    .module("pcard.sidebar", [])
    .component("pcardSidebar", SidebarComponent)
    .name;