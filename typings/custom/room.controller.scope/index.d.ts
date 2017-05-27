/// <reference path="../user/index.d.ts" />
/// <reference path="../user/index.d.ts" />

declare interface IRoomControllerScope extends ng.IScope {
    room: number;
    list: string[];
    selectedItem: any;
    selectedList: any[];
    selectCard: (element: any) => void;
    banUser: (user: IUser) => void;
    currentUser: IUser;
    attendees: any[]
}