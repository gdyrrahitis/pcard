declare interface IHttpService {
    get(url: string): ng.IHttpPromise<any>;
}

declare interface ISocketService {
    socketId: string;
    on(eventName: string, callback: any): void;
    emit(eventName: string, data?: any, callback?: any): void;
}

declare interface INotificationService {
    success(message: string, title?: string, options?: ToastrOptions): void;
    info(message: string, title?: string, options?: ToastrOptions): void;
    warning(message: string, title?: string, options?: ToastrOptions);
    error(message: string, title?: string, options?: ToastrOptions): void;
}