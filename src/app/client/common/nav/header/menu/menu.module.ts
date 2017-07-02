import * as angular from "angular";
import "angular-ui-router";

import { MenuComponent } from "./menu.component";

export const MenuModule = angular
    .module("pcard.menu", ["ui.router"])
    .component("pcardMenu", MenuComponent)
    .name;