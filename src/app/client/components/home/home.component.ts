import * as angular from "angular";

import {
    RoomsFullEvent, RoomNotFoundEvent, InternalServerErrorEvent,
    RoomsAllEvent, UsersAllEvent, RequestAllRoomsEvent, RequestAllUsersEvent,
    RoomCreateEvent, RoomJoinEvent
} from "../../../domain/events/index";

const template = require("./home.html");
class Messages {
    static roomsFullMessage: string = "All rooms are being used. Try again later!";
    static remoteErrorMessage: string = "Oh snap! An error occured, please try again later";
    static roomNotFoundMesage: string = "Could not find room";
    static provideUsernameMessage: string = "Please provide a username";
    static provideRoomIdMessage: string = "Room id is not valid, please provide one";
    static dismissedDialog: string = "User dismissed dialog";
}
export const HomeComponent: ng.IComponentOptions = {
    template: template,
    controller: class HomeComponent implements IHomeComponent {
        private _totalRooms: number;
        private _rooms: number;
        private _users: number;

        public username: string;
        public roomId: string;
        public alerts: { message: string }[] = [];

        public get rooms(): number {
            return this._rooms;
        }

        public get users(): number {
            return this._users;
        }

        public get totalRooms(): number {
            return this._totalRooms;
        };

        static $inject = ["httpService", "socketService", "$localStorage", "notificationService", "$state", "$uibModal", "$document"];
        constructor(private http: IHttpService, private socketService: ISocketService,
            private $localStorage, private notificationService: INotificationService,
            private $state: ng.ui.IStateService, private $uibModal: ng.ui.bootstrap.IModalService,
            private $document: ng.IDocumentService) {
            this.socketService.on(RoomsFullEvent.eventName, this.roomsFull);
            this.socketService.on(RoomNotFoundEvent.eventName, this.roomNotFound);
            this.socketService.on(InternalServerErrorEvent.eventName, this.internalServerError);
            this.socketService.on(RoomsAllEvent.eventName, this.allRooms);
            this.socketService.on(UsersAllEvent.eventName, this.allUsers);
        }

        private roomsFull = () => this.alerts.push({ message: Messages.roomsFullMessage });
        private roomNotFound = () => this.alerts.push({ message: Messages.roomNotFoundMesage });
        private internalServerError = (error: Error) => this.alerts.push({ message: error.message });
        private allRooms = (rooms: number) => this._rooms = rooms;
        private allUsers = (users: number) => {
            this._users = users;
        }

        public $onInit() {
            this.http.get("/rooms").then(this.success, this.fail);
            this.socketService.emit(RequestAllRoomsEvent.eventName);
            this.socketService.emit(RequestAllUsersEvent.eventName);
        }

        private success = (response: ng.IHttpPromiseCallbackArg<{ limit: number }>) => {
            this._totalRooms = response.data.limit;
        }

        private fail = (response: ng.IHttpPromiseCallbackArg<any>) => {
            this.alerts.push({ message: Messages.remoteErrorMessage });
        }

        public create = () => {
            if (this.username) {
                this.$localStorage.username = this.username;
                let roomCreateEvent = new RoomCreateEvent({ name: this.username });
                this.socketService.emit(RoomCreateEvent.eventName,
                    roomCreateEvent.data,
                    (response) => this.navigateToLocationBasedOnResponse(response, `/room/${response.roomId}`));
            } else {
                this.alerts.push({ message: Messages.provideUsernameMessage });
            }
        }

        private navigateToLocationBasedOnResponse(response: any, location: string) {
            if (response.access) {
                this.$state.go(location);
            }
        }

        public join = (roomId: string) => {
            if (roomId) {
                if (this.username) {
                    this.$localStorage.username = this.username;
                    let roomJoinEvent = new RoomJoinEvent({ name: this.username, roomId: roomId });
                    this.socketService.emit(RoomJoinEvent.eventName,
                        roomJoinEvent.data,
                        (response) => this.navigateToLocationBasedOnResponse(response, `/room/${roomId}`));
                } else {
                    this.alerts.push({ message: Messages.provideUsernameMessage });
                }
            } else {
                this.alerts.push({ message: Messages.provideRoomIdMessage });
            }
        }

        private closeAlert = (index: number) => {
            this.alerts.splice(index, 1);
        }

        public modal = () => {
            //let parentElement = angular.element(this.$document[0].querySelector(".page-header")).parent();
            this.$uibModal.open({
                component: "pcardModal",
                //appendTo: parentElement
            }).result.then((value: any) => {
                            console.log("closing")
                this.join(value);
            }, (reason: any) => {
                this.notificationService.info(Messages.dismissedDialog, "Dismiss", { progressBar: true });
            });
        }
    }
};