import { SocketService } from "../../services/socket.service/socket.service";
import { BaseComponent } from "../base.component/base.component";

class MenuController extends BaseComponent {
    private privateLeaveEvent: string = "room-leave";
    private root: string = "/";

    static $inject = ["$scope", "$location", "$localStorage", "socketService"];
    constructor(protected $scope: IMenuControllerScope,
        private $location: ng.ILocationService,
        private $localStorage: ILocalStorage,
        private socketService: SocketService
    ) {
        super($scope);
        this.setUniqueId("MenuController");

        this.$scope.navigateToHome = this.navigateToHome;
    }

    public navigateToHome = () => {
        if (this.$localStorage.id) {
            this.broadcastLeave();
        }

        this.$location.path(this.root);
    }

    private broadcastLeave() {
        this.socketService.emit(this.privateLeaveEvent, { id: this.$localStorage.id });
    }
}

export const MenuComponent: ng.IComponentOptions = {
    templateUrl: "./menu.component.html",
    controller: MenuController
};