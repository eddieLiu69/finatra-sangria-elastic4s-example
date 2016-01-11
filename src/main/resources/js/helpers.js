var com;
(function (com) {
    var eddie;
    (function (eddie) {
        var utility;
        (function (utility) {
            var AjaxHelper = (function () {
                function AjaxHelper() {
                }
                AjaxHelper.Invoke = function (args) {
                    var targetArgs = $.extend({}, AjaxHelper.defaultSettings, args);
                    return $.ajax(targetArgs);
                };
                AjaxHelper.defaultSettings = {
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    cache: false,
                    error: function (result) { return console.log(result.status + "|" + result.statusText + "| " + result.responseText); }
                };
                return AjaxHelper;
            })();
            utility.AjaxHelper = AjaxHelper;
            var Snackbar = (function () {
                function Snackbar() {
                }
                Snackbar.show = function (options) {
                    if (!this._notification)
                        throw "div.mdl-js-snackbar doesn't exist in body";
                    this._notification.MaterialSnackbar.showSnackbar($.extend(options, { timeout: 2000 }));
                };
                Snackbar.cleanup = function () {
                    this._notification.MaterialSnackbar.cleanup_();
                };
                Snackbar._notification = document.querySelector(".mdl-js-snackbar");
                return Snackbar;
            })();
            utility.Snackbar = Snackbar;
        })(utility = eddie.utility || (eddie.utility = {}));
    })(eddie = com.eddie || (com.eddie = {}));
})(com || (com = {}));
