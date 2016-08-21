import { SocketService } from "../socket.service/socket.service";

export class HomeController {
    "use strict";

    constructor(private $scope, private $log: any, 
                private $location: any,
                private socketService: SocketService) {
        $scope.room;
        $scope.createRoom = this.createRoom;
        $scope.submitRoom = this.submitRoom;
        $scope.message = "Hello world!";
    }

    createRoom = () => {
        console.log("Clicked room");
        this.$location.path("/room/1");
    };

    submitRoom = (form) => {
        if(!form.invalid) {
            this.$location.path("/room/" + this.$scope.room);
        }
    };
}