import { SocketService } from "../../services/socket.service/socket.service";
import { BaseController } from "../base.controller/base.controller";
import { UserRole } from "../../../domain/index";
import { RoomShowAllEvent, RoomGetAllEvent, UserBanStart, BanEvent, RoomDisconnectEvent } from "../../../domain/events/index";

export class RoomController extends BaseController {
    private onRouteChangeOff: any;
    private isBanned: boolean = false;

    constructor(protected $scope: IRoomControllerScope,
        private $rootScope: ng.IScope,
        private $location: ng.ILocationService,
        private $routeParams: IRoomRoute,
        private $localStorage: ILocalStorage,
        private socketService: SocketService,
        private cards: string[],
        private $window: ng.IWindowService
    ) {
        super($scope);
        this.setUniqueId("RoomController");

        $scope.list = cards;
        $scope.selectedList = [];
        $scope.selectCard = this.selectCard;
        $scope.banUser = this.banUser;
        $localStorage.id = this.socketService.socketId;

        let roomGetAllEvent = new RoomGetAllEvent({ roomId: $routeParams.id });
        this.socketService.emit(RoomGetAllEvent.eventName, roomGetAllEvent.data);
        this.socketService.on(RoomShowAllEvent.eventName, this.showAttendees);
        this.$scope.$on(UserBanStart.eventName, () => this.isBanned = true);
        this.onRouteChangeOff = this.$rootScope.$on("$locationChangeStart", this.routeChange);
    }

    public selectCard = (element) => {
        this.$scope.selectedItem = element.card;
        this.$scope.selectedList.push(this.$scope.selectedItem);
    }

    public banUser = (user: UserRole) => {
        this.socketService.emit(BanEvent.eventName, { roomId: this.$routeParams.id, userId: user.id });
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

    private routeChange = (event: ng.IAngularEvent, newUrl: string) => {
        if (!this.isBanned) {
            this.isBanned = false;
            if (this.$window.confirm("Are you sure you want to leave?")) {
                let roomDisconnectEvent = new RoomDisconnectEvent({ roomId: this.$routeParams.id, userId: this.$localStorage.id });
                this.socketService.emit(RoomDisconnectEvent.eventName,
                    roomDisconnectEvent.data,
                    () => {
                        this.onRouteChangeOff();
                        event.preventDefault();
                        this.$location.path("/");
                    });
            }

            event.preventDefault();
            return;
        }
    }
}