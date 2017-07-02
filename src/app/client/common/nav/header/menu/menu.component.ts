export const MenuComponent: ng.IComponentOptions = {
    templateUrl: "./menu.html",
    controller: class MenuComponent {

        static $inject = ["$location"];
        constructor(private $location: ng.ILocationService) { }

        public navigateToHome() {
            this.$location.path("/");
        }

        public navigateToHelp() {
            this.$location.path("/help");
        }
    }
};