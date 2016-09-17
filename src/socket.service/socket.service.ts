import io = require('socket.io-client');
var config: ClientAppConfig.ClientConfiguration = require("../client.config.json!json");

export class SocketService {
    "use strict";

    private socket: SocketIOClient.Socket;
    private data: any;

    constructor(private $rootScope: ng.IScope) {
        this.socket = io.connect(config.client.baseUrl);
    }

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