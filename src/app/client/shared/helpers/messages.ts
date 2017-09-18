export class Messages {
    static readonly userIsBannedByModerator: string = "User is banned from room by moderator";
    static readonly roomIsNotDefined: string = "Room id is not defined, unexpected error occured";
    static readonly userDisconnectedFromRoom: string = "User disconnected from room:";

    static readonly title: { ban: "Ban", error: "Error", disconnect: "Disconnect" } = {
        ban: "Ban",
        disconnect: "Disconnect",
        error: "Error"
    };
}