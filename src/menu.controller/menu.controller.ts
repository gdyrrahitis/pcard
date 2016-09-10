import {SocketService} from "../socket.service/socket.service";

export class MenuController {
    "use strict";
    
    constructor(private $scope: IMenuControllerScope,
        private $location: ng.ILocationService,
        private $localStorage: ILocalStorage,
        private socketService: SocketService) {
        this.$scope.navigateToHome = this.navigateToHome;
    }

    navigateToHome = () => {
        var id = this.$localStorage.id;
        this.socketService.emit("private-leave", {
            id: id
        });
        this.$location.path("/");
    };
}