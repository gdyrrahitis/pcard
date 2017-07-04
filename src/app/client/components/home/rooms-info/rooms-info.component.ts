import * as angular from "angular";

export const RoomsInfoComponent: ng.IComponentOptions = {
    bindings: {
        rooms: "<",
        totalRooms: "<"
    },
    templateUrl: "./rooms-info.html"
};