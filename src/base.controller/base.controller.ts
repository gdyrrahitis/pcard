export class BaseController {

    constructor(protected $scope:any) {
        $scope.controllerId;
    }

    setUniqueId = (id: string) => {
        this.$scope.controllerId = id;
    }
}