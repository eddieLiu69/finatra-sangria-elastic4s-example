declare module com.eddie.utility {
    class AjaxHelper {
        static defaultSettings: JQueryAjaxSettings;
        static Invoke<T>(args: JQueryAjaxSettings): JQueryPromise<T>;
    }
    class Snackbar {
        private static _notification;
        static show(options: ISnackbarOption): void;
        static cleanup(): void;
    }
    interface ISnackbarOption {
        message: string;
        timeout?: number;
        actionHandler?: Function;
        actionText?: string;
    }
}
