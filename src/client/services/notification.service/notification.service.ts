export class NotificationService {
    static $inject = ["$toastr"];
    
    constructor(private toast: Toastr) { }

    public success(message: string, title?: string, options?: ToastrOptions): void {
        this.toast.success(message, title, options);
    }

    public info(message: string, title?: string, options?: ToastrOptions): void {
        this.toast.info(message, title, options);
    }

    public warning(message: string, title?: string, options?: ToastrOptions): void {
        this.toast.warning(message, title, options);
    }

    public error(message: string, title?: string, options?: ToastrOptions): void {
        this.toast.error(message, title, options);
    }
}