export class Event {
    static readonly Connection = "connection";
    static readonly InternalServerError = "internal-server-error";
    static readonly RoomNotFound = "room-not-found";
    static readonly RoomsFull = "rooms-full";
    static readonly UserBanned = "user-banned";
    static readonly UserDisconnected = "user-disconnected";
    static readonly RoomShowAll = "room-show-all";
    static readonly RoomCreate = "room-create";
    static readonly RoomsAll = "rooms-all";
    static readonly UsersAll = "users-all";
    static readonly RoomDisconnect = "room-disconnect";
    static readonly RoomJoin = "room-join";
    static readonly RoomLeave = "room-leave";
    static readonly Ban = "ban";
    static readonly RoomGetAll = "room-get-all";
    static readonly RequestAllRooms = "request-all-rooms";
    static readonly RequestAllUsers = "request-all-users";
    static readonly ModalJoinResult = "modal-join-result";
    static readonly UserBanStart = "user-ban-start";
}