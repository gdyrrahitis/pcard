declare interface IFooterComponent {
    githubUrl: string,
    twitterUrl: string,
    freePikUrl: string
    flatIconsUrl: string;
    creativeCommonsUrl: string;
}

declare interface IMenuComponent {
    navigateToHome(): void;
    navigateToHelp(): void;
}

declare interface ISidebarComponent {
    buttons: Button[];
    startPlanning(): void;
    resetPlanning(): void;
    stopPlanning(): void;
    planningLock(): void;
    planningUnlock(): void;
    planningShow(): void;
}

declare interface IHomeComponent {
    $onInit(): void;
    username: string;
    roomId: string;
    totalRooms: number;
    alerts: { message: string }[];
    create(): void;
    join(roomId: string): void;
}

declare interface IRoomsInfoComponent {
    rooms: number,
    totalRooms: number
}

declare interface IUsersInfoComponent {
    users: number
}

declare interface IModalComponent {
    resolve: { roomId?: string };
    $onInit(): void;
    ok(): void;
    cancel(): void;
}
// TODO: IDeckComponent
// TODO: IRoomComponent
// TODO: ICardComponent
// TODO: IParticipantListComponent
// TODO: IParticipantDetailsComponent
// TODO: ISelectedCardsComponent