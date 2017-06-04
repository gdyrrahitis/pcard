import { SocketService } from "../../services/socket.service/socket.service";
import { BaseController } from "../base.controller/base.controller";

export class HomeController extends BaseController {
    constructor(protected $scope: IHomeControllerScope,
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private $localStorage: ILocalStorage,
        private socketService: SocketService
    ) {
        super($scope);
        this.setUniqueId("HomeController");

        $scope.clickedCreate = false;
        $scope.error = undefined;
        $scope.createRoom = this.createRoom;
        $scope.submitRoom = this.submitRoom;

        this.socketService.on("rooms-full", this.allRoomsOccupied);
        this.socketService.on("room-not-found", this.roomNotFound);
        this.socketService.on("internal-server-error", this.internalServerError);
        this.disconnectUserIfGetsToHome(this.socketService.socketId);
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
            let data = { name: this.$scope.name, roomId: this.$scope.room };
            this.socketService.emit("room-join", data, (response) => {
                if (response.access) {
                    this.$location.path(`/room/${this.$scope.room}`);
                }
            });
        }
    }

    private disconnectUserIfGetsToHome(id: string) {
        if (!id) {
            return;
        }

        this.socketService.emit("disconnect", id);
    }

    private roomNotFound = () => this.$scope.error = "Could not find room.";
    private allRoomsOccupied = () => this.$scope.error = "All rooms are busy. Try again later!";
    private internalServerError = (error: Error) => this.$scope.error = error.message;
}