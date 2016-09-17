import { SocketService } from "../socket.service/socket.service";
import { BaseController } from "../base.controller/base.controller";

export class HomeController extends BaseController {
    "use strict";

    constructor(protected $scope: IHomeControllerScope,
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private $localStorage: ILocalStorage,
        private socketService: SocketService
    ) {
        super($scope);
        this.setUniqueId("HomeController");

        $scope.clickedCreate = false;
        $scope.error;
        $scope.createRoom = this.createRoom;
        $scope.submitRoom = this.submitRoom;

        this.socketService.on("room-access-granted", this.accessGranted);
        this.socketService.on("room-occupied", this.accessDenied);
        this.socketService.on("all-rooms-occupied", this.allRoomsOccupied);
        this.socketService.on("room-not-found", this.roomNotFound);

        this.disconnectUserIfGetsToHome(this.socketService.getId());
    }

    createRoom = () => {
        let room = 1;
        this.join("create-private", room, (data) => {
            if (data.access) {
                this.$location.path(`/room/${room}`);
            }
        });
    };

    submitRoom = (form: ng.IFormController) => {
        if (form.$valid) {
            this.join("join-private", this.$scope.room, (data) => {
                if (data.access) {
                    this.$location.path(`/room/${this.$scope.room}`);
                }
            });
        }
    };

    private join = (event: string, room: number, callback?: any) => {
        this.socketService.emit(event, {
            userId: this.socketService.getId(),
            room: room
        }, callback);
    };

    private disconnectUserIfGetsToHome(id: string) {
        if (!id) return;
        this.socketService.emit("disconnect", id);
    }

    private accessGranted = (data: any) => this.$location.path(`/room/${data.room}`);
    private roomNotFound = () => this.$scope.error = "Could not find room.";
    private accessDenied = () => this.$scope.error = "Cannot access room because it is already booked!";
    private allRoomsOccupied = () => this.$scope.error = "All rooms are busy. Try again later!";
}