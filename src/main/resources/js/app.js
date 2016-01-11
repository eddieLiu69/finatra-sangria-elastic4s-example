var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="../tsd/_references.ts" />
var com;
(function (com) {
    var eddie;
    (function (eddie) {
        var example;
        (function (example) {
            var uti = com.eddie.utility;
            var BookApp = (function () {
                function BookApp(container) {
                    this.container = container;
                    this._bookRepo = new BookRepo();
                    this.bindEvents();
                    this.refresh(0);
                }
                Object.defineProperty(BookApp.prototype, "contentTmpl", {
                    get: function () {
                        var _this = this;
                        var dfd = null;
                        if (this._contentTmpl) {
                            dfd = $.Deferred();
                            dfd.resolve(this._contentTmpl);
                        }
                        else
                            dfd = $.get('/assets/template/bookTmpl.mst', function (tmpl) { return _this._contentTmpl = tmpl; });
                        return dfd;
                    },
                    enumerable: true,
                    configurable: true
                });
                BookApp.prototype.loading = function () {
                    this.container.prepend("<div id='loader' class=\"mdl-spinner mdl-js-spinner is-active\"></div>");
                };
                BookApp.prototype.bindEvents = function () {
                    var _this = this;
                    $("button#add").on('click', function () { return new BookCreationModal().run().done(function () { return _this.refresh(800); }); });
                    $("#keyword-bar #txtKeyword").keyup(function (e) {
                        if (e.keyCode == 13)
                            _this.refresh(0, e.target.value);
                    });
                    $('main').on('click', '.mdl-menu__item', function (e) {
                        var target = $(e.target), action = target.attr('action'), entityId = target.parent().attr('for');
                        switch (action) {
                            case 'U':
                                new BookUpdateModal(entityId).run().done(function () { return _this.refresh(1000); });
                                break;
                            case 'D':
                                $.confirm("Delete specific book?", function () { return _this._bookRepo.deleteBook(entityId).done(function () { return _this.refresh(1000); }); });
                                break;
                            default:
                                throw "Unknow action type: " + action;
                        }
                    });
                };
                BookApp.prototype.render = function (container, data) {
                    var _this = this;
                    this.container.find(".book-card").remove();
                    this.contentTmpl.done(function (tmpl) {
                        var rendered = Mustache.render(tmpl, { books: data });
                        $('#loader').remove();
                        _this.container.prepend(rendered);
                        var elements = document.getElementsByClassName("book-menu");
                        componentHandler.upgradeElements($.map(elements, function (val) { return val; }));
                    });
                };
                BookApp.prototype.refresh = function (latency, keyword) {
                    var _this = this;
                    $.progress();
                    //ES is NEAR REAL TIME Search Engine
                    setTimeout(function () { return _this._bookRepo.getBooks(keyword).done(function (rlt) {
                        $.progress(false);
                        _this.render(_this.container, rlt.data.books);
                    }); }, latency);
                };
                return BookApp;
            })();
            example.BookApp = BookApp;
            var BookModal = (function () {
                function BookModal(title) {
                    var _this = this;
                    this.title = title;
                    this._bookRepo = new BookRepo();
                    this._modalDfd = $.Deferred();
                    this._failedHandler = function (msg) {
                        console.log("Failed to save: " + msg);
                        uti.Snackbar.show({ message: 'Failed to save...' });
                    };
                    this._modal = $.modal({
                        title: title,
                        content: "<div class='mdl-spinner mdl-js-spinner is-active'></div>",
                        cancelable: false,
                        negative: {
                            title: 'Dismiss',
                            click: function () {
                                _this._modalDfd.reject();
                                return $.Deferred().resolve();
                            }
                        },
                        positive: {
                            title: "Submit",
                            click: function () { return _this.submit().done(function () { return _this._modalDfd.resolve(); }); }
                        },
                        onLoaded: function () {
                        }
                    });
                }
                Object.defineProperty(BookModal, "tmpl", {
                    get: function () {
                        var dfd = null;
                        if (BookModal._tmpl) {
                            dfd = $.Deferred();
                            dfd.resolve(BookModal._tmpl);
                        }
                        else
                            dfd = $.get('/assets/template/bookModalTmpl.mst', function (tmpl) { return BookModal._tmpl = tmpl; });
                        return dfd;
                    },
                    enumerable: true,
                    configurable: true
                });
                BookModal.prototype.getArg = function () {
                    return {
                        title: $.trim(this._modal.find('#txtTitle').val()),
                        desc: $.trim(this._modal.find('#txtDesc').val()),
                        author: $.trim(this._modal.find('#txtAuthor').val()),
                        publisher: $.trim(this._modal.find('#txtPublisher').val()),
                        ISBN: this._modal.find('#txtISBN').val()
                    };
                };
                BookModal.prototype.validate = function () {
                    var targets = this._modal.find(".mdl-textfield").map(function (i, ele) { return ele["MaterialTextfield"]; }).toArray();
                    return $.grep(targets, function (ins) { return !ins.checkValidity(); }).length === 0;
                };
                BookModal.prototype.submit = function () {
                    var _this = this;
                    var arg = this.getArg(), dfd = $.Deferred();
                    if (this.validate()) {
                        $.progress();
                        this.save(arg)
                            .always(function (resp) {
                            $.progress(false);
                            if (resp.error || resp.errors) {
                                dfd.reject();
                                var errMsg = resp.error ? resp.error().responseText : resp.errors[0].message;
                                _this._failedHandler(errMsg);
                            }
                            else
                                dfd.resolve();
                        });
                    }
                    else
                        dfd.reject();
                    return dfd;
                };
                BookModal.prototype.render = function (tmpl, data) {
                    var rendered = (data) ? Mustache.render(tmpl, data) : tmpl;
                    this._modal.find('#content').html(rendered);
                    var elements = document.getElementsByClassName("mdl-textfield");
                    componentHandler.upgradeElements($.map(elements, function (val) { return val; }));
                };
                return BookModal;
            })();
            example.BookModal = BookModal;
            var BookCreationModal = (function (_super) {
                __extends(BookCreationModal, _super);
                function BookCreationModal() {
                    _super.call(this, "Create New Book");
                    this.randomStr = function () { return Math.random().toString(36).substring(7); };
                    this.randomInt = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };
                }
                BookCreationModal.prototype.run = function () {
                    var _this = this;
                    BookModal.tmpl.done(function (tmpl) { return _this.render(tmpl); });
                    //BookModal.tmpl.done((tmpl) => this.render(tmpl, {
                    //    title: this.randomStr(),
                    //    desc: this.randomStr(),
                    //    author: this.randomStr(),
                    //    publisher: this.randomStr(),
                    //    ISBN: this.randomInt(100000, 999999),
                    //}));
                    return this._modalDfd;
                };
                BookCreationModal.prototype.save = function (arg) {
                    return this._bookRepo.addBook(arg);
                };
                return BookCreationModal;
            })(BookModal);
            example.BookCreationModal = BookCreationModal;
            var BookUpdateModal = (function (_super) {
                __extends(BookUpdateModal, _super);
                function BookUpdateModal(bookId) {
                    _super.call(this, "Update Book");
                    this.bookId = bookId;
                }
                BookUpdateModal.prototype.run = function () {
                    var _this = this;
                    $.when(this._bookRepo.getBook(this.bookId), BookModal.tmpl)
                        .done(function (rlt, tmpl) { return _this.render(tmpl, rlt[0].data.book); })
                        .fail(function () { return alert('Failed to load book detailed'); });
                    return this._modalDfd;
                };
                BookUpdateModal.prototype.save = function (arg) {
                    return this._bookRepo.updateBook(this.bookId, arg);
                };
                return BookUpdateModal;
            })(BookModal);
            example.BookUpdateModal = BookUpdateModal;
            var BookRepo = (function () {
                function BookRepo() {
                }
                BookRepo.prototype.getBook = function (id) {
                    return uti.AjaxHelper.Invoke({
                        url: '/api/books',
                        data: { query: "query bookEntity { book(id: \"" + id + "\") " + BookRepo.bookRtnSubCls + " }" },
                    });
                };
                BookRepo.prototype.getBooks = function (keyword) {
                    var arg = (keyword) ? "(keyword: \"" + keyword + "\")" : "";
                    return uti.AjaxHelper.Invoke({
                        url: '/api/books',
                        data: { query: "query bookEntities { books" + arg + " " + BookRepo.bookRtnSubCls + " }" },
                    });
                };
                BookRepo.prototype.addBook = function (arg) {
                    return uti.AjaxHelper.Invoke({
                        url: '/api/books',
                        method: 'Post',
                        data: JSON.stringify({
                            mutation: "mutation newBook { addBook(title: \"" + arg.title + "\", desc: \"" + arg.desc + "\", author: \"" + arg.author + "\", publisher: \"" + arg.publisher + "\", ISBN: " + arg.ISBN + ") " + BookRepo.bookRtnSubCls + " }"
                        })
                    });
                };
                BookRepo.prototype.updateBook = function (id, arg) {
                    return uti.AjaxHelper.Invoke({
                        url: '/api/books',
                        method: 'Post',
                        data: JSON.stringify({
                            mutation: "mutation updateBook { updateBook(id: \"" + id + "\",  title: \"" + arg.title + "\", desc: \"" + arg.desc + "\", author: \"" + arg.author + "\", publisher: \"" + arg.publisher + "\", ISBN: " + arg.ISBN + ") " + BookRepo.bookRtnSubCls + " }"
                        })
                    });
                };
                BookRepo.prototype.deleteBook = function (id) {
                    return uti.AjaxHelper.Invoke({
                        url: '/api/books',
                        method: 'POST',
                        data: JSON.stringify({
                            mutation: "mutation deleteBook { deleteBook(id: \"" + id + "\") }"
                        })
                    });
                };
                BookRepo.bookRtnSubCls = '{ id, title, desc, author, publisher, ISBN }';
                return BookRepo;
            })();
            example.BookRepo = BookRepo;
        })(example = eddie.example || (eddie.example = {}));
    })(eddie = com.eddie || (com.eddie = {}));
})(com || (com = {}));
