export class SocketService {
    constructor(private $rootScope: ng.IScope, private socket: SocketIOClient.Socket) { }

    public get socketId() {
        return this.socket.id;
    }

    public on(eventName: string, callback: any) {
        this.socket.on(eventName, (...args) =>
            this.applyOnRootScope(callback, args));
    }

    private applyOnRootScope = (callback, args) =>
        this.$rootScope.$apply(this.actOnCallback(callback, args));

    private actOnCallback = (callback, args) =>
        this.actOnCallbackIfItIsDefined(callback, args);

    private actOnCallbackIfItIsDefined = (callback, args) =>
        callback ? callback.apply(this.socket, args) : undefined;

    public emit(eventName: string, data?: any, callback?: any) {
        this.socket.emit(eventName, data, (...args) =>
            this.applyOnRootScopeOnDefinedCallback(callback, args));
    }

    private applyOnRootScopeOnDefinedCallback = (callback, args) =>
        this.$rootScope.$apply(this.actOnCallbackIfItIsDefined(callback, args));
}