const template = require("./users-info.html");

export const UsersInfoComponent: ng.IComponentOptions = {
    template: template,
    bindings: {
        users: "<"
    }
};