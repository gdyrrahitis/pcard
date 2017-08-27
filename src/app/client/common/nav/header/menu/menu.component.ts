const template = require("./menu.html");
export const MenuComponent: ng.IComponentOptions = {
    template: template,
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