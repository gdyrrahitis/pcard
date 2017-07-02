declare interface IHomeControllerScope extends ng.IScope {
    clickedCreate: boolean;
    error: string;
    createRoom: () => void;
    joinRoom: (roomId: string) => void;
    room: number;
    join: ()=> void;
    create: () => void;
    users: number;
    rooms: number;
}