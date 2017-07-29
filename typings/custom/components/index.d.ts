declare interface IFooterComponent {
    githubUrl: string,
    twitterUrl: string,
    freePikUrl: string
    flatIconsUrl: string;
    creativeCommonsUrl: string;
}

// TODO: IHelpComponent
// TODO: IHeaderComponent
declare interface IMenuComponent {
    navigateToHome(): void;
    navigateToHelp(): void;
}


// TODO: ISidebarComponent
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