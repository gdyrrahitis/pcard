export class SocketService {
    "use strict";

    private data: any;

    constructor(private $rootScope: ng.IScope, private socket: SocketIOClient.Socket) { }

    getId() {
        return this.socket.id;
    }

    on(eventName, callback) {
        this.socket.on(eventName, (...args) =>
            this.applyOnRootScope(callback, args));
    }

    private applyOnRootScope = (callback, args) => {
        return this.$rootScope.$apply(this.actOnCallback(callback, args));
    }

    private actOnCallback = (callback, args) => {
        return this.actOnCallbackIfItIsDefined(callback, args);
    }

    private actOnCallbackIfItIsDefined = (callback, args) => {
        return callback ? callback.apply(this.socket, args) : undefined;
    }

    emit(eventName, data?, callback?) {
        this.socket.emit(eventName, data, (...args) =>
            this.applyOnRootScopeOnDefinedCallback(callback, args));
    }

    private applyOnRootScopeOnDefinedCallback = (callback, args) => {
        return this.$rootScope.$apply(() => this.actOnCallbackIfItIsDefined(callback, args));
    }
}