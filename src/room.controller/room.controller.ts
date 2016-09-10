import {SocketService} from "../socket.service/socket.service";

export class RoomController {
    "use strict";

    private mountainGoat = ["zero", "half", "one", "two", "three", "five", "eight", "thirteen", "twenty", "forty", "one-hundred", "coffee", "question"];

    constructor(private $scope: IRoomControllerScope,
        private $log: ng.ILogService,
        private $routeParams: IRoomRoute,
        private $localStorage: ILocalStorage,
        private socketService: SocketService) {
        $scope.room = $routeParams.id;
        $scope.list = this.mountainGoat;
        $scope.selectedItem;
        $scope.selectedList = [];
        $scope.selectCard = this.selectCard;
        $scope.banUser = this.banUser;
        $scope.currentUser;

        this.$localStorage.id = this.socketService.getId();
        this.socketService.on("show-attendees", this.showAttendees);
        this.socketService.emit("get-all-attendees", $routeParams.id);
    }

    selectCard = (element) => {
        this.$scope.selectedItem = element.card;
        this.$scope.selectedList.push(this.$scope.selectedItem);
    };

    banUser = (user: IUser) => {
        this.socketService.emit("ban", user);
    };

    private showAttendees = (data: any[]) => {
        var that = this;

        var currentUser = data.filter((x) => {
            return x.userId === that.$localStorage.id;
        });

        if(currentUser.length > 0) {
            that.$scope.currentUser = currentUser[0];
        }

        var attendees = data.filter((x) => {
            return x.userId !== that.$localStorage.id;
        });
        this.$scope.attendees = attendees;
    }
}