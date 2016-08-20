export class RoomController {
    "use strict";
    private mountainGoat = ["0", "1/2", "1", "2", "3", "5", "8", "13", "20", "40", "100", "cup", "?"];

    constructor(private $scope: any, private $log: any) {
        $scope.list = this.mountainGoat;
        $scope.selectedItem;
        $scope.selectedList = [];
        $scope.selectCard = this.selectCard;
    }

    selectCard = (element) => {
        this.$log.info(element);
        this.$scope.selectedItem = element.card;
        this.$scope.selectedList.push(this.$scope.selectedItem);
    };
}