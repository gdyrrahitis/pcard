interface IRoomControllerScope extends ng.IScope {
    room: number;
    list: string[];
    selectedItem: any;
    selectedList: any[];
    selectCard: (element: any) => void;
    banUser: (user: any) => void;
    currentUser: any;
    attendees: any[]
}