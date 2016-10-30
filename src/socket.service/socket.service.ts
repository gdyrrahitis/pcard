export class SocketService {
    "use strict";

    private data: any;

    constructor(private $rootScope: ng.IScope, private socket: SocketIOClient.Socket) { }

    getId() {
        return this.socket.id;
    }

    on(eventName, callback) {
        this.socket.on(eventName, (...args) => {
            this.$rootScope.$apply(() => {
                callback.apply(this.socket, args);
            });
        });
    }

    emit(eventName, data?, callback?) {
        this.socket.emit(eventName, data, (...args) => {
            this.$rootScope.$apply(() => {
                if (callback) {
                    callback.apply(this.socket, args);
                }
            });
        });
    }

}