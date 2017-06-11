import { SocketService, NotificationService, ModalService, HttpService } from "../../services/index";
import {
    ModalJoinResultEvent, RoomsFullEvent, RoomNotFoundEvent,
    InternalServerErrorEvent, RoomsAllEvent, UsersAllEvent,
    RequestAllRoomsEvent, RequestAllUsersEvent, RoomCreateEvent,
    RoomJoinEvent
} from "../../../domain/events/index";
import { BaseController } from "../base.controller/base.controller";

export class HomeController extends BaseController {
    constructor(protected $scope: IHomeControllerScope,
        private $location: ng.ILocationService,
        private $localStorage: ILocalStorage,
        private socketService: SocketService,
        private notificationService: NotificationService,
        private modalService: ModalService,
        private httpService: HttpService
    ) {
        super($scope);
        this.setUniqueId("HomeController");

        $scope.alerts = [];
        $scope.clickedCreate = false;
        $scope.createRoom = this.createRoom;
        $scope.joinRoom = this.joinRoom;
        $scope.join = this.join;
        $scope.closeAlert = this.closeAlert;
        let username = $localStorage.username;
        if (username) {
            $scope.username = $localStorage.username;
        }

        $scope.$on(ModalJoinResultEvent.eventName, (event, roomId) => this.joinRoom(roomId));
        this.socketService.on(RoomsFullEvent.eventName, this.roomsFull);
        this.socketService.on(RoomNotFoundEvent.eventName, this.roomNotFound);
        this.socketService.on(InternalServerErrorEvent.eventName, this.internalServerError);
        this.socketService.on(RoomsAllEvent.eventName, this.allRooms);
        this.socketService.on(UsersAllEvent.eventName, this.allUsers);
        this.socketService.emit(RequestAllRoomsEvent.eventName);
        this.socketService.emit(RequestAllUsersEvent.eventName);
        httpService.get("/rooms").then(this.success, this.fail);
    }

    private success = (response: ng.IHttpPromiseCallbackArg<{ limit: number }>) => {
        this.$scope.totalRooms = response.data.limit;
    }

    private fail = (response: ng.IHttpPromiseCallbackArg<any>) => {
        this.$scope.alerts.push({ message: "Oh snap! An error occured, please try again later" });
    }

    public createRoom = () => {
        if (this.$scope.username) {
            this.$localStorage.username = this.$scope.username;
            let roomCreateEvent = new RoomCreateEvent({ name: this.$scope.username });
            this.socketService.emit(RoomCreateEvent.eventName,
                roomCreateEvent.data,
                (response) => this.navigateToLocationBasedOnResponse(response, `/room/${response.roomId}`));
        } else {
            this.notificationService.error("Please provide a username", "Error", { progressBar: true });
        }
    }

    private navigateToLocationBasedOnResponse(response: any, location: string) {
        if (response.access) {
            this.$location.path(location);
        }
    }

    public joinRoom = (roomId: string) => {
        if (roomId) {
            if (this.$scope.username) {
                this.$localStorage.username = this.$scope.username;
                let roomJoinEvent = new RoomJoinEvent({ name: this.$scope.username, roomId: roomId });
                this.socketService.emit(RoomJoinEvent.eventName,
                    roomJoinEvent.data,
                    (response) => this.navigateToLocationBasedOnResponse(response, `/room/${roomId}`));
            } else {
                this.notificationService.error("Please provide a username", "Error", { progressBar: true });
            }
        } else {
            this.notificationService.error("Room id is not valid, please provide one", "Error", { progressBar: true });
        }
    }

    private roomNotFound = () => {
        this.$scope.alerts.push({ message: "Could not find room" });
    }

    private roomsFull = () => {
        this.$scope.alerts.push({ message: "All rooms are being used. Try again later!" });
    }

    private internalServerError = (error: Error) => {
        this.$scope.alerts.push({ message: error.message });
    }

    public join = () => {
        this.modalService.open({
            animation: true,
            templateUrl: "src/client/controllers/join.room.modal.controller/join.room.modal.controller.html",
            controller: "joinRoomModalController",
            size: "md",
            scope: this.$scope
        });
    }

    private allRooms = (rooms: number) => {
        this.$scope.rooms = rooms;
    }

    private allUsers = (users: number) => {
        this.$scope.users = users;
    }

    public closeAlert = (index: number) => {
        this.$scope.alerts.splice(index, 1);
    }
}