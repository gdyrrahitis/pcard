export class HttpService {
    static $inject = ["$http"];
    
    constructor(private $http: ng.IHttpService) {}

    public get(url: string): ng.IHttpPromise<any> {
        return this.$http.get(url);
    }
}