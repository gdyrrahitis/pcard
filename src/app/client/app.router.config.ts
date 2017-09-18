export const routerConfig = ($locationProvider: ng.ILocationProvider) => {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    }).hashPrefix("!");
};
routerConfig.$inject = ["$locationProvider"];