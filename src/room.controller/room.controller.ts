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

        this.$localStorage.id = this.socketService.getId();
        this.socketService.on("show-attendees", this.showAttendees);
    }

    selectCard = (element) => {
        this.$log.info(element);
        this.$scope.selectedItem = element.card;
        this.$scope.selectedList.push(this.$scope.selectedItem);
    };

    private showAttendees(data) {
        console.log("Showing attendees");
        console.log(data);
    }
}