export class BaseController {
    constructor(protected $scope:any) {
        $scope.controllerId = undefined;
    }

    public setUniqueId = (id: string) => {
        this.$scope.controllerId = id;
    }
}