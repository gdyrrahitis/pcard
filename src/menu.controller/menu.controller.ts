import {SocketService} from "../socket.service/socket.service";

export class MenuController {
    "use strict";
    
    constructor(private $scope: any,
        private $location: any,
        private $localStorage: any,
        private socketService: SocketService) {
        this.$scope.navigateToHome = this.navigateToHome;
    }

    navigateToHome = () => {
        var id = this.$localStorage.id;
        console.log(id);
        this.socketService.emit("private-leave", {
            id: id
        });
        this.$location.path("/");
    };
}