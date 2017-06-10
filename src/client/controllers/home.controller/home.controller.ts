import { SocketService, NotificationService, ModalService, HttpService } from "../../services/index";
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

        $scope.$on("modal-join-result", (event, roomId) => this.joinRoom(roomId));
        this.socketService.on("rooms-full", this.roomsFull);
        this.socketService.on("room-not-found", this.roomNotFound);
        this.socketService.on("internal-server-error", this.internalServerError);
        this.socketService.on("rooms-all", this.allRooms);
        this.socketService.on("users-all", this.allUsers);
        this.socketService.emit("request-all-rooms");
        this.socketService.emit("request-all-users");
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
            this.socketService.emit("room-create", {
                name: this.$scope.username
            }, (response) => {
                if (response.access) {
                    this.$location.path(`/room/${response.roomId}`);
                }
            });
        } else {
            this.notificationService.error("Please provide a username", "Error", { progressBar: true });
        }
    }

    public joinRoom = (roomId: string) => {
        if (roomId) {
            if (this.$scope.username) {
                this.$localStorage.username = this.$scope.username;
                let data = { name: this.$scope.username, roomId: roomId };

                this.socketService.emit("room-join", data, (response) => {
                    if (response.access) {
                        this.$location.path(`/room/${roomId}`);
                    }
                });
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