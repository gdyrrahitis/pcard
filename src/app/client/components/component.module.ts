import angular from "angular";

import { HomeModule, ModalModule, RoomModule } from "./index";

export const ComponentModule = angular.module("pcard.component", [
    HomeModule,
    ModalModule,
    RoomModule
]).name;