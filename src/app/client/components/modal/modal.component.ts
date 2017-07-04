import * as angular from "angular";

export const ModalComponent: ng.IComponentOptions = {
    bindings: {
        resolve: "<",
        close: "&",
        dismiss: "&"
    },
    templateUrl: "./modal.html",
    controller: class ModalComponent implements IModalComponent {
        public resolve: { roomId: string };
        private roomId: string;
        private close: (result: { roomId: string }) => void;
        private dismiss: (action: string) => void;

        public $onInit() {
            if (this.resolve) {
                this.roomId = this.resolve.roomId;
            }
        }

        public ok() {
            this.close({ roomId: this.roomId });
        }

        public cancel() {
            this.dismiss("cancel");
        }
    }
};