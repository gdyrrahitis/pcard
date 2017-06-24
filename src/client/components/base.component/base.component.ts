export class BaseComponent {
    constructor(protected $scope: any) { }

    public setUniqueId = (id: string) => {
        this.$scope.componentId = id;
    }
}