import { NotificationService, SocketService, SharedModule, Messages } from "./shared/index";
import { UserBannedEvent, UserDisconnectedEvent, UserBanStart } from "../domain/events/index";

const home: string = "home";
export const runner = ($rootScope: ng.IScope,
    $state: ng.ui.IStateService,
    socketService: SocketService,
    notificationService: NotificationService) => {
    const options: ToastrOptions = { progressBar: true };
    socketService.on(UserBannedEvent.eventName, onUserBanned);
    socketService.on(UserDisconnectedEvent.eventName, onUserDisconnected);

    function onUserBanned() {
        $rootScope.$broadcast(UserBanStart.eventName);
        $state.go(home);

        notificationService.info(Messages.userIsBannedByModerator, Messages.title.ban, options);
    }

    function onUserDisconnected(roomId: string) {
        roomId ? notificationService.warning(`${Messages.userDisconnectedFromRoom} ${roomId}`, Messages.title.disconnect, options)
            : notificationService.error(Messages.roomIsNotDefined, Messages.title.error, options);
    }
}
runner.$inject = ["$rootScope", "$state", "socketService", "notificationService"];