(function (JQueryStatic) {
    $.progress = function (show) {
        if (show === void 0) { show = true; }
        var id = 'progress-loader';
        if (show) {
            // remove existing loaders
            $('.loading-container').remove();
            $("<div id=\"" + id + "\" class=\"loading-container\"><div><div class=\"mdl-spinner mdl-js-spinner is-active\"></div></div></div>").appendTo("body");
            componentHandler.upgradeElements($('.mdl-spinner').get());
            setTimeout(function () { return $("#" + id).css({ opacity: 1 }); }, 1);
        }
        else {
            $("#" + id).css({ opacity: 0 });
            setTimeout(function () { return $("#" + id).remove(); }, 400);
        }
    };
    $.modal = function (options) {
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
        var dialog = $("<div id='" + options.id + "' class=\"dialog-container\"><div class=\"mdl-card mdl-shadow--16dp\"></div></div>");
        var content = dialog.find('.mdl-card');
        if (options.contentStyle)
            content.css(options.contentStyle);
        if (options.title)
            $("<h5 id='title'>" + options.title + "</h5>").appendTo(content);
        if (options.content)
            $("<p id='content' class='dialog-content'></p>").html(options.content).appendTo(content);
        if (options.negative || options.positive) {
            var buttonBar = $('<div class="mdl-card__actions dialog-button-bar"></div>');
            if (options.negative) {
                options.negative = $.extend({
                    id: 'negative',
                    title: 'Cancel',
                    click: function () { return $.Deferred().resolve(); }
                }, options.negative);
                var negButton = $('<button class="mdl-button mdl-js-button mdl-js-ripple-effect" id="' + options.negative.id + '">' + options.negative.title + '</button>');
                negButton.click(function (e) {
                    e.preventDefault();
                    options.negative.click(e).done(function () { return $.modelHide(dialog); });
                });
                negButton.appendTo(buttonBar);
            }
            if (options.positive) {
                options.positive = $.extend({
                    id: 'positive',
                    title: 'OK',
                    click: function () { return $.Deferred().resolve(); }
                }, options.positive);
                var posButton = $('<button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="' + options.positive.id + '">' + options.positive.title + '</button>');
                posButton.click(function (e) {
                    e.preventDefault();
                    options.positive.click(e).done(function () { return $.modelHide(dialog); });
                });
                posButton.appendTo(buttonBar);
            }
            buttonBar.appendTo(content);
        }
        componentHandler.upgradeDom();
        $(document).bind("keyup.dialog", function (e) {
            if (e.which == 27)
                $.modelHide(dialog);
        });
        if (options.cancelable) {
            dialog.click(function () { return $.modelHide(dialog); });
            content.click(function (e) { return e.stopPropagation(); });
        }
        dialog.appendTo("body");
        setTimeout(function () {
            dialog.css({ opacity: 1 });
            if (options.onLoaded)
                options.onLoaded();
        }, 1);
        return dialog;
    };
    $.modelHide = function (dialog) {
        $(document).unbind("keyup.dialog");
        dialog.css({ opacity: 0 });
        setTimeout(function () { return dialog.remove(); }, 400);
    };
    $.confirm = function (content, confirmDelg, dismissDelg) {
        if (dismissDelg === void 0) { dismissDelg = function () { return $.Deferred().resolve(); }; }
        $.modal({
            title: "CONFIRMATION",
            content: content,
            positive: {
                title: "CONFIRM",
                click: function () { return confirmDelg(); }
            },
            negative: {
                title: "DISMISS",
                click: function () { return dismissDelg(); }
            }
        });
    };
})(jQuery);
