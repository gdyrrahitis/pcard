import { SocketService } from "../../services/socket.service/socket.service";
import { BaseController } from "../base.controller/base.controller";
var config: ClientAppConfig.ClientConfiguration = require("../../client.config.json");

export class RoomController extends BaseController {
    private mountainGoat = config.poker.mountainGoat;

    constructor(protected $scope: IRoomControllerScope,
        private $log: ng.ILogService,
        private $routeParams: IRoomRoute,
        private $localStorage: ILocalStorage,
        private socketService: SocketService
    ) {
        super($scope);
        this.setUniqueId("RoomController");

        $scope.room = $routeParams.id;
        $scope.list = this.mountainGoat;
        $scope.selectedItem = undefined;
        $scope.selectedList = [];
        $scope.selectCard = this.selectCard;
        $scope.banUser = this.banUser;
        $scope.currentUser = undefined;

        this.$localStorage.id = this.socketService.socketId;
        this.socketService.on("show-attendees", this.showAttendees);
        this.socketService.emit("get-all-attendees", $routeParams.id);
    }

    public selectCard = (element) => {
        this.$scope.selectedItem = element.card;
        this.$scope.selectedList.push(this.$scope.selectedItem);
    }

    public banUser = (user: IUser) => {
        this.socketService.emit("ban", user);
    }

    private showAttendees = (data: any[]) => {
        this.showCurrentUser(data);
        this.showAllAttendeesExceptCurrentUser(data);
    }

    private showCurrentUser = (data: any[]) => {
        var currentUser = data.filter(x => x.userId === this.$localStorage.id)[0];

        if (currentUser) {
            this.$scope.currentUser = currentUser;
        }
    }

    private showAllAttendeesExceptCurrentUser = (data: any[]) => {
        var attendees = data.filter(x => x.userId !== this.$localStorage.id);
        this.$scope.attendees = attendees;
    }
}