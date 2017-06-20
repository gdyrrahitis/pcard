export class ModalService {
    private modalInstance: angular.ui.bootstrap.IModalInstanceService;

    constructor(private $uiModal: angular.ui.bootstrap.IModalService) { }

    public open(options: angular.ui.bootstrap.IModalSettings) {
        this.modalInstance = this.$uiModal.open(options);
        options.scope.$uibModalInstance = this.modalInstance;
    }

    public dismiss(reason?: any) {
        if (this.modalInstance) {
            this.modalInstance.dismiss(reason);
        }
    }

    public close(result?: any) {
        if (this.modalInstance) {
            this.modalInstance.close(result);
        }
    }
}