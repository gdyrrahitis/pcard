import * as angular from "angular";
const template = require("./rooms-info.html");
export const RoomsInfoComponent: ng.IComponentOptions = {
    bindings: {
        rooms: "<",
        totalRooms: "<"
    },
    template: template
};