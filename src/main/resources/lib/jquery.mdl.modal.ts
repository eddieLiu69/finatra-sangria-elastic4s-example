interface JQueryStatic {
    progress: (show?: boolean) => void;
    modal: (options: ModalOption) => JQuery;
    modelHide: (dialog: JQuery) => void;
    confirm: (content: string, confirmDelg?: () => JQueryPromise<any>, dismissDelg?: () => JQueryPromise<any>) => void;
}

(function (JQueryStatic) {
    $.progress = (show: boolean = true) => {
        var id = 'progress-loader';
        if (show) {
            // remove existing loaders
            $('.loading-container').remove();
            $(`<div id="${id}" class="loading-container"><div><div class="mdl-spinner mdl-js-spinner is-active"></div></div></div>`).appendTo("body");

            componentHandler.upgradeElements($('.mdl-spinner').get());
            setTimeout(() => $(`#${id}`).css({ opacity: 1 }), 1);
        } else {
            $(`#${id}`).css({ opacity: 0 });
            setTimeout(() => $(`#${id}`).remove(), 400);
        }
    };
    $.modal = (options: ModalOption): JQuery => {
        options = $.extend({
            id: 'mdl-modal',
            title: null,
            content: null,
            negative: false,
            positive: false,
            cancelable: true,
            contentStyle: null,
            onLoaded: false
        }, options);

        // remove existing dialogs
        $('.dialog-container').remove();
        $(document).unbind("keyup.dialog");

        var dialog = $(`<div id='${options.id}' class="dialog-container"><div class="mdl-card mdl-shadow--16dp"></div></div>`);
        var content = dialog.find('.mdl-card');
        if (options.contentStyle) content.css(options.contentStyle);
        if (options.title) $(`<h5 id='title'>${options.title}</h5>`).appendTo(content);
        if (options.content) $(`<p id='content' class='dialog-content'></p>`).html(options.content).appendTo(content);
        
        if (options.negative || options.positive) {
            var buttonBar = $('<div class="mdl-card__actions dialog-button-bar"></div>');
            if (options.negative) {
                options.negative = $.extend({
                    id: 'negative',
                    title: 'Cancel',
                    click: () => $.Deferred().resolve()
                }, options.negative);
                var negButton = $('<button class="mdl-button mdl-js-button mdl-js-ripple-effect" id="' + options.negative.id + '">' + options.negative.title + '</button>');
                negButton.click((e) => {
                    e.preventDefault();
                    options.negative.click(e).done(() => $.modelHide(dialog));
                });
                negButton.appendTo(buttonBar);
            }
            if (options.positive) {
                options.positive = $.extend({
                    id: 'positive',
                    title: 'OK',
                    click: () => $.Deferred().resolve()
                }, options.positive);
                var posButton = $('<button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="' + options.positive.id + '">' + options.positive.title + '</button>');
                posButton.click((e) => {
                    e.preventDefault();
                    options.positive.click(e).done(() => $.modelHide(dialog));
                });
                posButton.appendTo(buttonBar);
            }
            buttonBar.appendTo(content);
        }
        componentHandler.upgradeDom();

        $(document).bind("keyup.dialog", (e) => {
            if (e.which == 27)
                $.modelHide(dialog);
        });
        if (options.cancelable) {
            dialog.click(() => $.modelHide(dialog));
            content.click((e) => e.stopPropagation());
        }
        dialog.appendTo("body");
        setTimeout(() => {
            dialog.css({ opacity: 1 });
            if (options.onLoaded)
                options.onLoaded();
        }, 1);
        return dialog;
    }
    $.modelHide = (dialog: JQuery) => {
        $(document).unbind("keyup.dialog");
        dialog.css({ opacity: 0 });
        setTimeout(() => dialog.remove(), 400);
    }
    $.confirm = (content, confirmDelg, dismissDelg = () => $.Deferred<any>().resolve()) => {
        $.modal({
            title: "CONFIRMATION",
            content: content,
            positive: {
                title: "CONFIRM",
                click: () => confirmDelg()
            },
            negative: {
                title: "DISMISS",
                click: () => dismissDelg()
            }
        });
    }
})(jQuery);

interface ModalOption {
    id?: string;
    title?: string;
    content?: string;
    negative?: { id?: string, title?: string, click?: (e: JQueryEventObject) => JQueryPromise<any>};
    positive?: { id?: string, title?: string, click?: (e: JQueryEventObject) => JQueryPromise<any> };
    cancelable?: boolean;
    contentStyle?: string;
    onLoaded?: Function;
}