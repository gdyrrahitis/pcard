import {SocketService} from "../socket.service/socket.service";
import { BaseController } from "../base.controller/base.controller";

export class MenuController extends BaseController {
    "use strict";
    
    constructor(protected $scope: IMenuControllerScope,
        private $location: ng.ILocationService,
        private $localStorage: ILocalStorage,
        private socketService: SocketService
    ) {
        super($scope);
        this.setUniqueId("MenuController");

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