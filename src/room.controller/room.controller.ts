import {SocketService} from "../socket.service/socket.service";

export class RoomController {
    "use strict";

    private mountainGoat = ["zero", "half", "one", "two", "three", "five", "eight", "thirteen", "twenty", "forty", "one-hundred", "coffee", "question"];

    constructor(private $scope: any,
        private $log: any,
        private $routeParams: any,
        private $localStorage: any,
        private socketService: SocketService) {
        $scope.room = $routeParams.id;
        $scope.list = this.mountainGoat;
        $scope.selectedItem;
        $scope.selectedList = [];
        $scope.selectCard = this.selectCard;
        $scope.banUser = this.banUser;

        this.$localStorage.id = this.socketService.getId();
        this.socketService.on("show-attendees", this.showAttendees);
        this.socketService.emit("get-all-attendees", $routeParams.id);
    }

    selectCard = (element) => {
        this.$log.info(element);
        this.$scope.selectedItem = element.card;
        this.$scope.selectedList.push(this.$scope.selectedItem);
    };

    banUser = (user: {id: any, userId: any, room: any}) => {
        console.log("Banning user: " + JSON.stringify(user));
        this.socketService.emit("ban", user);
    };

    private showAttendees = (data) => {
        var that = this;
        var attendees = data.filter((x) => {
            return x.userId !== that.$localStorage.id;
        });
        console.log(JSON.stringify(attendees));
        this.$scope.attendees = attendees;
    }
}