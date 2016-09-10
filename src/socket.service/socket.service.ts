import io = require('socket.io-client');

export class SocketService {
    "use strict";

    private socket: SocketIOClient.Socket;
    private data: any;

    constructor(private $rootScope: ng.IScope) {
        this.socket = io.connect("http://localhost:54879");
    }

    getId () {
        return this.socket.id;
    }

    on(eventName, callback) {
        var that = this;
        that.socket.on(eventName, function () {
            var args = arguments;
            that .$rootScope.$apply(function () {
                callback.apply(that .socket, args);
            });
        });
    }

    emit(eventName, data?, callback?) {
        var that = this;
        that.socket.emit(eventName, data, function () {
            var args = arguments;
            that.$rootScope.$apply(function () {
                if (callback) {
                    callback.apply(that.socket, args);
                }
            });
        });
    }

}