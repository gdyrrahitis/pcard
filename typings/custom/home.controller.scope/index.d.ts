/// <reference path="../../globals/angular/index.d.ts" />

declare interface IHomeControllerScope extends ng.IScope {
    clickedCreate: boolean;
    error: string;
    createRoom: () => void;
    submitRoom: (form: ng.IFormController) => void;
    room: number;
}