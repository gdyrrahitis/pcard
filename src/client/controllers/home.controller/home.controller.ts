import { SocketService, NotificationService } from "../../services/index";
import { BaseController } from "../base.controller/base.controller";

export class HomeController extends BaseController {
    constructor(protected $scope: IHomeControllerScope,
        private $location: ng.ILocationService,
        private $localStorage: ILocalStorage,
        private socketService: SocketService,
        private notificationService: NotificationService
    ) {
        super($scope);
        this.setUniqueId("HomeController");

        $scope.clickedCreate = false;
        $scope.error = undefined;
        $scope.createRoom = this.createRoom;
        $scope.submitRoom = this.submitRoom;

        this.socketService.on("rooms-full", this.roomsFull);
        this.socketService.on("room-not-found", this.roomNotFound);
        this.socketService.on("internal-server-error", this.internalServerError);
    }

    public createRoom = (form: ng.IFormController) => {
        if (form.$valid) {
            this.socketService.emit("room-create", {
                name: this.$scope.name
            }, (response) => {
                if (response.access) {
                    this.$location.path(`/room/${response.roomId}`);
                }
            });
        }
    }

    public submitRoom = (form: ng.IFormController) => {
        if (form.$valid) {
            let data = { name: this.$scope.guestName, roomId: this.$scope.room };

            this.socketService.emit("room-join", data, (response) => {
                if (response.access) {
                    this.$location.path(`/room/${this.$scope.room}`);
                }
            });
        }
    }

    private roomNotFound = () => {
        this.$scope.error = "Could not find room.";
    }

    private roomsFull = () => {
        this.$scope.error = "All rooms are being used. Try again later!";
    }

    private internalServerError = (error: Error) => {
        this.$scope.error = error.message;
    }
}