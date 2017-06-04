import { SocketService } from "../../services/socket.service/socket.service";
import { BaseController } from "../base.controller/base.controller";
import { UserRole } from "../../../domain/user";
import * as ng from "angular";

export class RoomController extends BaseController {
    private config: ClientAppConfig.ClientConfiguration;
    private mountainGoat;

    constructor(protected $scope: IRoomControllerScope,
        private $log: ng.ILogService,
        private $routeParams: IRoomRoute,
        private $localStorage: ILocalStorage,
        private socketService: SocketService,
        private configuration: ClientAppConfig.ClientConfiguration
    ) {
        super($scope);
        this.setUniqueId("RoomController");
        
        this.config = configuration;
        this.mountainGoat = configuration.poker.mountainGoat;

        $scope.room = $routeParams.id;
        $scope.list = this.mountainGoat;
        $scope.selectedItem = undefined;
        $scope.selectedList = [];
        $scope.selectCard = this.selectCard;
        $scope.banUser = this.banUser;
        $scope.currentUser = undefined;

        this.$localStorage.id = this.socketService.socketId;
        this.socketService.on("room-show-all", this.showAttendees);
        this.socketService.emit("room-get-all", { roomId: $routeParams.id });
    }

    public selectCard = (element) => {
        this.$scope.selectedItem = element.card;
        this.$scope.selectedList.push(this.$scope.selectedItem);
    }

    public banUser = (user: IUser) => {
        this.socketService.emit("ban", { roomId: this.$routeParams.id, userId: user.id });
    }

    private showAttendees = (users: UserRole[]) => {
        this.showCurrentUser(users);
        this.showAllAttendeesExceptCurrentUser(users);
    }

    private showCurrentUser = (users: UserRole[]) => {
        var currentUser = users.filter(x => x.id === this.$localStorage.id)[0];
        if (currentUser) {
            this.$scope.currentUser = currentUser;
        }
    }

    private showAllAttendeesExceptCurrentUser = (users: UserRole[]) => {
        var attendees = users.filter(x => x.id !== this.$localStorage.id);
        this.$scope.attendees = attendees;
    }
}