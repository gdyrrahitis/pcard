import { ModalJoinResultEvent } from "../../../domain/events/index";
export class JoinRoomModalController {
    constructor(private $scope: ng.IScope, private $uibModalInstance: angular.ui.bootstrap.IModalServiceInstance) {
        $scope.go = this.go;
        $scope.cancel = this.cancel;

        this.$uibModalInstance.result.then((value) => {
            let modalJoinResultEvent = new ModalJoinResultEvent(value);
            $scope.$emit(ModalJoinResultEvent.eventName, modalJoinResultEvent.result);
        });
    }

    public go = () => {
        this.$uibModalInstance.close(this.$scope.roomId);
    }

    public cancel = () => {
        this.$uibModalInstance.dismiss("cancel");
    }
}