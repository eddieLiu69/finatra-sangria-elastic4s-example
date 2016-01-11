module com.eddie.utility {
    export class AjaxHelper {
        static defaultSettings: JQueryAjaxSettings = {
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            error: (result) => console.log(`${result.status}|${result.statusText}| ${result.responseText}`)
        };

        static Invoke<T>(args: JQueryAjaxSettings): JQueryPromise<T> {
            var targetArgs: JQueryAjaxSettings = $.extend({}, AjaxHelper.defaultSettings, args);
            return $.ajax(targetArgs);
        }
    }

    export class Snackbar {
        private static _notification: Element = document.querySelector(`.mdl-js-snackbar`);
        static show(options: ISnackbarOption) {
            if (!this._notification) throw `div.mdl-js-snackbar doesn't exist in body`;
            (<any>this._notification).MaterialSnackbar.showSnackbar($.extend(options, { timeout : 2000}));
        }

        static cleanup() {
            (<any>this._notification).MaterialSnackbar.cleanup_();
        }
    }

    export interface ISnackbarOption {
        message: string;
        timeout?: number;
        actionHandler?: Function;
        actionText?: string;
    }
}