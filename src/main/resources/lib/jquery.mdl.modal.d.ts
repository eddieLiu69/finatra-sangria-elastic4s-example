interface JQueryStatic {
    progress: (show?: boolean) => void;
    modal: (options: ModalOption) => JQuery;
    modelHide: (dialog: JQuery) => void;
    confirm: (content: string, confirmDelg?: () => JQueryPromise<any>, dismissDelg?: () => JQueryPromise<any>) => void;
}
interface ModalOption {
    id?: string;
    title?: string;
    content?: string;
    negative?: {
        id?: string;
        title?: string;
        click?: (e: JQueryEventObject) => JQueryPromise<any>;
    };
    positive?: {
        id?: string;
        title?: string;
        click?: (e: JQueryEventObject) => JQueryPromise<any>;
    };
    cancelable?: boolean;
    contentStyle?: string;
    onLoaded?: Function;
}
