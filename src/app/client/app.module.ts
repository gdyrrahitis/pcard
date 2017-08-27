import * as angular from "angular";
import * as toast from "toastr";
import * as io from "socket.io-client";
import "ngstorage";
import "angular-sanitize";
import "angular-ui-router";

import { UserBannedEvent, UserDisconnectedEvent, UserBanStart } from "../domain/events/index";
import { CommonModule, HelpModule } from "./common/index";
import { ComponentModule } from "./components/index";
import { NotificationService, SocketService, SharedModule } from "./shared/index";
import { AppComponent } from "./app.component";

const home: string = "/";
class Messages {
    static readonly userIsBannedByModerator: string = "User is banned from room by moderator";
    static readonly roomIsNotDefined: string = "Room id is not defined, unexpected error occured";
    static readonly userDisconnectedFromRoom: string = "User disconnected from room:";

    static readonly title: { ban: "Ban", error: "Error", disconnect: "Disconnect" } = {
        ban: "Ban",
        disconnect: "Disconnect",
        error: "Error"
    };
}

const runner = ($rootScope: ng.IScope,
    $location: ng.ILocationService,
    socketService: SocketService,
    notificationService: NotificationService) => {
    const options: ToastrOptions = { progressBar: true };
    socketService.on(UserBannedEvent.eventName, onUserBanned);
    socketService.on(UserDisconnectedEvent.eventName, onUserDisconnected);

    function onUserBanned() {
        $rootScope.$broadcast(UserBanStart.eventName);
        //TODO: state $location.path(home);

        notificationService.info(Messages.userIsBannedByModerator, Messages.title.ban, options);
    }

    function onUserDisconnected(roomId: string) {
        roomId ? notificationService.warning(`${Messages.userDisconnectedFromRoom} ${roomId}`, Messages.title.disconnect, options)
            : notificationService.error(Messages.roomIsNotDefined, Messages.title.error, options);
    }
}
runner.$inject = ["$rootScope", "$location", "socketService", "notificationService"];

const routerConfig = ($locationProvider: ng.ILocationProvider) => {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    }).hashPrefix("!");
};
routerConfig.$inject = ["$locationProvider"];

export const AppModule = angular.module("pcard", [
    "ui.bootstrap",
    "ngSanitize",
    "ngStorage",
    "ui.router",
    CommonModule,
    ComponentModule,
    SharedModule,
    HelpModule
])
    .component("pcardApp", AppComponent)
    .config(routerConfig)
    .run(runner)
    .name;