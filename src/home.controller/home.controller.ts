import { SocketService } from "../socket.service/socket.service";

export class HomeController {
    "use strict";

    constructor(private $scope, 
        private $log: any,
        private $location: any,
        private $localStorage: any,
        private socketService: SocketService) {
        $scope.clickedCreate = false;
        $scope.errorSingle;
        $scope.errorAll;
        $scope.createRoom = this.createRoom;
        $scope.submitRoom = this.submitRoom;

        this.socketService.on("room-access-granted", this.accessGranted);
        this.socketService.on("room-occupied", this.accessDenied);
        this.socketService.on("all-rooms-occupied", this.allRoomsOccupied);
    }

    createRoom = () => {
        let room = 1;
        this.join(room);
        this.$location.path(`/room/${room}`);
    };

    submitRoom = (form) => {
        if (form.$valid) {
            this.join(this.$scope.room);
            this.$location.path(`/room/${this.$scope.room}`);
        }

        // TODO: Print errors
    };
 
    private join = (room: number) => {
        this.socketService.emit("join-private", {
            userId: this.socketService.getId(),
            room: room
        });
    };

    private accessGranted = (data) => {
        this.$location.path(`/room/${data.room}`);
    }

    private accessDenied = () => {
        this.$scope.errorSingle = {
            singleRoom: {
                msg: "Cannot access room because it is already booked!"
            }
        };
        this.$log.error(this.$scope.errorSingle.singleRoom.msg);
    }

    private allRoomsOccupied = () => {
        this.$scope.errorAll = {
            allRooms: {
                msg: "All rooms are busy. Try again later!"
            }
        };
        this.$log.error(this.$scope.errorAll.allRooms.msg);
    }
}