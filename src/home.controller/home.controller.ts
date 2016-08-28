import { SocketService } from "../socket.service/socket.service";

export class HomeController {
    "use strict";

    constructor(private $scope,
        private $log: any,
        private $location: any,
        private $localStorage: any,
        private socketService: SocketService) {
        $scope.clickedCreate = false;
        $scope.error;
        $scope.createRoom = this.createRoom;
        $scope.submitRoom = this.submitRoom;

        this.socketService.on("room-access-granted", this.accessGranted);
        this.socketService.on("room-occupied", this.accessDenied);
        this.socketService.on("all-rooms-occupied", this.allRoomsOccupied);
        this.socketService.on("room-not-found", this.roomNotFound);

        var id = this.socketService.getId();
        if (id) {
            this.socketService.emit("disconnect", id);
        }
    }

    createRoom = () => {
        let that = this;
        let room = 1;
        this.join("create-private", room, (data) => {
            if (data.access) {
                that.$location.path(`/room/${room}`);
            }
        });
    };

    submitRoom = (form) => {
        let that = this;
        if (form.$valid) {
            this.join("join-private", this.$scope.room, (data) => {
                if (data.access) {
                    that.$location.path(`/room/${that.$scope.room}`);
                }
            });
        }

        // TODO: Print errors
    };

    private roomNotFound = () => {
        this.$scope.error = "Could not find room.";
    };

    private join = (event: string, room: number, callback?: any) => {
        this.socketService.emit(event, {
            userId: this.socketService.getId(),
            room: room
        }, callback);
    };

    private accessGranted = (data) => {
        this.$location.path(`/room/${data.room}`);
    }

    private accessDenied = () => {
        this.$scope.error = "Cannot access room because it is already booked!";
    }

    private allRoomsOccupied = () => {
        this.$scope.error = "All rooms are busy. Try again later!";
    }
}