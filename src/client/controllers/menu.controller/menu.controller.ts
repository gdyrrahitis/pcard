import { SocketService } from "../../services/socket.service/socket.service";
import { BaseController } from "../base.controller/base.controller";

export class MenuController extends BaseController {
    private privateLeaveEvent: string = "private-leave";
    private root: string = "/";

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
        this.broadcastLeave();
        this.$location.path(this.root);
    }

    private broadcastLeave() {
        this.socketService.emit(this.privateLeaveEvent, this.eventArguments);
    }

    private get eventArguments() {
        let id = this.$localStorage.id;
        return {
            id: id
        };
    }
}