export class HomeController {
    "use strict";

    constructor(private $scope, private $log: any, private $location: any) {
        $scope.createRoom = this.createRoom;
        $scope.message = "Hello world!";
    }

    createRoom = () => {
        console.log("Clicked room");
        this.$location.path("/room/1");
    };
}