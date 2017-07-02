import * as angular from "angular";

import { FooterComponent } from "./footer.component";
import { SharedModule } from "../../../shared/index";

export const FooterModule = angular
    .module("pcard.footer", [SharedModule])
    .component("pcardFooter", FooterComponent)
    .name;