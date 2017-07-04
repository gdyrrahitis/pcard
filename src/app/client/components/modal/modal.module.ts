import * as angular from "angular";
import "angular-ui-bootstrap";

import { ModalComponent } from "./modal.component";

export const ModalModule = angular
    .module("pcard.modal", ["ui.bootstrap"])
    .component("pcardModal", ModalComponent)
    .name;