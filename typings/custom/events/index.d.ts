declare interface Exception {
    id: string,
    name: string,
    message: string
}

declare interface CreateRoomEventArgs {
    name: string
}

declare interface CreateRoomEventCallback {
    ($data: CreateRoomCallbackArgs): void
}

declare interface CreateRoomCallbackArgs {
    access: boolean,
    roomId?: string
}

declare interface RoomJoinEventArgs {
    roomId: string
    name: string
}

declare interface RoomJoinCallback {
    ($data: RoomJoinCallbackArgs): void
}

declare interface RoomJoinCallbackArgs {
    access: boolean,
    roomId?: string
}

declare interface RoomDisconnectEventArgs {
    roomId: string
    userId: string
}

declare interface BanEventArgs {
    roomId: string
    userId: string
}


declare interface RoomGetAllEventArgs {
    roomId: string
}

declare interface RoomBusyEventArgs {
    roomId: string
}

declare interface RoomFreeEventArgs {
    roomId: string
}

declare interface RoomDeckLockEventArgs {
    roomId: string
}

declare interface RoomDeckUnlockEventArgs {
    roomId: string
}

declare interface RoomResetEventArgs {
    roomId: string
}

declare interface RoomDeckResetEventArgs {
    roomId: string
}

declare interface RoomDeckCardAssociateEventArgs {
    roomId: string,
    userId: string,
    cardId: string
}

declare interface RoomDeckCardAssociateCallbackArgs {
    associated: boolean
}

declare interface RoomDeckCardDisassociateEventArgs {
    roomId: string,
    userId: string,
    cardId: string
}

declare interface RoomDeckCardDisassociateCallbackArgs {
    disassociated: boolean
}

declare interface RoomDeckCardAssociateCallback {
    ($data: RoomDeckCardAssociateCallbackArgs): void
}

declare interface RoomDeckCardDisassociateCallback {
    ($data: RoomDeckCardDisassociateCallbackArgs): void
}