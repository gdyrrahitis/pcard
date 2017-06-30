import angular from "angular";

import { FooterModule, HeaderModule, MenuModule } from "./index";

export const CommonModule = angular.module("pcard.common", [
    HeaderModule,
    MenuModule,
    FooterModule
]).name;