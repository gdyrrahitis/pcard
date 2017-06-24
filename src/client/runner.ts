import { SocketService, NotificationService } from "./services/index";
import { UserBannedEvent, UserDisconnectedEvent, UserBanStart } from "../domain/events/index";

export class Runner {
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
        this.$location.path("/");

        this.notificationService
            .info("User is banned from room by moderator", "Ban", { progressBar: true });
    }

    private onUserDisconnected = (roomId: string) => {
        if (roomId) {
            this.notificationService
                .warning(`User disconnected from room: ${roomId}`, "Disconnect", { progressBar: true });
        } else {
            this.notificationService
                .error("Room id is not defined, unexpected error occured", "Error", { progressBar: true });
        }
    }
}