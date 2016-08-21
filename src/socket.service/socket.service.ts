import io = require('socket.io-client');

export class SocketService {
    "use strict";
    
    private socket: any;
    private data: any;

    constructor(private $rootScope: any) {
        this.socket = io.connect("http://localhost:54879");
    }

    on(eventName, callback) {
        this.socket.on(eventName, () => {
            var args = arguments;
            this.$rootScope.$apply(() => {
                callback.apply(this.socket, args);
            });
        });
    }

    emit(eventName, data, callback) {
        this.socket.emit(eventName, data, () => {
            var args = arguments;
            this.$rootScope.$apply(() => {
                if (callback) {
                    callback.apply(this.socket, args);
                }
            });
        });
    }

}