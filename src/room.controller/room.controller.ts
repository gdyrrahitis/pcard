export class RoomController {
    "use strict";
    
    private mountainGoat = ["zero", "half", "one", "two", "three", "five", "eight", "thirteen", "twenty", "forty", "one-hundred", "coffee", "question"];

    constructor(private $scope: any, private $log: any, $routeParams) {
        $scope.room = $routeParams.id;
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