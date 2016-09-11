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
        var that = this;
        that.socket.on(eventName, () => {
            var args = arguments;
            that.$rootScope.$apply(() => {
                callback.apply(that.socket, args);
            });
        });
    }

    emit(eventName, data?, callback?) {
        var that = this;
        that.socket.emit(eventName, data, () => {
            var args = arguments;
            that.$rootScope.$apply(() => {
                if (callback) {
                    callback.apply(that.socket, args);
                }
            });
        });
    }

}