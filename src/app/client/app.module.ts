import * as angular from "angular";
import * as toast from "toastr";
import * as io from "socket.io-client";

import { UserBannedEvent, UserDisconnectedEvent, UserBanStart } from "../domain/events/index";
import { CommonModule } from "./common/index";
import { ComponentModule } from "./components/index";
import { NotificationService, SocketService, SharedModule } from "./shared/index";
import { AppComponent } from "./app.component";
import { socket } from "./app.socket"; // Connects client socket

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
export class Runner {
    private options: ToastrOptions = { progressBar: true };

    static $inject = ["$rootScope", "$location", "socketService", "notificationService"];
    constructor(private $rootScope: ng.IScope,
        private $location: ng.ILocationService,
        private socketService: SocketService,
        private notificationService: NotificationService) {

        socketService.on(UserBannedEvent.eventName, this.onUserBanned);
        socketService.on(UserDisconnectedEvent.eventName, this.onUserDisconnected);
    }

    private onUserBanned = () => {
        this.$rootScope.$broadcast(UserBanStart.eventName);
        this.$location.path(home);

        this.notificationService.info(Messages.userIsBannedByModerator, Messages.title.ban, this.options);
    }

    private onUserDisconnected = (roomId: string) => {
        roomId ? this.notificationService.warning(`${Messages.userDisconnectedFromRoom} ${roomId}`, Messages.title.disconnect, this.options)
            : this.notificationService.error(Messages.roomIsNotDefined, Messages.title.error, this.options);
    }
}

export const AppModule = angular.module("app", [
    require("angular-ui-bootstrap"),
    require("angular-sanitize"),
    require("ngstorage"),
    CommonModule,
    ComponentModule,
    SharedModule
]).component("app.component", AppComponent).run(Runner).name;