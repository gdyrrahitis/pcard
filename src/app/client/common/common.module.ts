import * as angular from "angular";

import { FooterModule, HeaderModule } from "./index";

export const CommonModule = angular.module("pcard.common", [
    HeaderModule,
    FooterModule
]).name;