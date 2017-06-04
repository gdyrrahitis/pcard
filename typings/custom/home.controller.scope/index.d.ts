declare interface IHomeControllerScope extends ng.IScope {
    clickedCreate: boolean;
    error: string;
    createRoom: (form: ng.IFormController) => void;
    submitRoom: (form: ng.IFormController) => void;
    room: number;
}