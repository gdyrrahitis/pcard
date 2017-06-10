export class JoinRoomModalController {
    constructor(private $scope: ng.IScope, private $uibModalInstance: angular.ui.bootstrap.IModalServiceInstance) {
        $scope.go = this.go;
        $scope.cancel = this.cancel;

        this.$uibModalInstance.result.then((value) => {
            $scope.$emit("modal-join-result", value);
        });
    }

    public go = () => {
        this.$uibModalInstance.close(this.$scope.roomId);
    }

    public cancel = () => {
        this.$uibModalInstance.dismiss("cancel");
    }
}