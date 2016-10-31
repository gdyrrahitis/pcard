export class SocketService {
    "use strict";

    private data: any;

    get socketId() {
        return this.socket.id;
    }

    constructor(private $rootScope: ng.IScope, private socket: SocketIOClient.Socket) { }

    on(eventName, callback) {
        this.socket.on(eventName, (...args) =>
            this.applyOnRootScope(callback, args));
    }

    private applyOnRootScope = (callback, args) =>
        this.$rootScope.$apply(this.actOnCallback(callback, args));

    private actOnCallback = (callback, args) =>
        this.actOnCallbackIfItIsDefined(callback, args);

    private actOnCallbackIfItIsDefined = (callback, args) =>
        callback ? callback.apply(this.socket, args) : undefined;

    emit(eventName, data?, callback?) {
        this.socket.emit(eventName, data, (...args) =>
            this.applyOnRootScopeOnDefinedCallback(callback, args));
    }

    private applyOnRootScopeOnDefinedCallback = (callback, args) =>
        this.$rootScope.$apply(this.actOnCallbackIfItIsDefined(callback, args));
}