///<reference path="../tsd/_references.ts" />
module com.eddie.example {
    import uti = com.eddie.utility;
    export class BookApp {
        private _bookRepo = new BookRepo();
        private _contentTmpl: string;
        private get contentTmpl(): JQueryDeferred<string> {
            var dfd = null;
            if (this._contentTmpl) {
                dfd = $.Deferred<string>();
                dfd.resolve(this._contentTmpl);
            }
            else
                dfd = $.get('/assets/template/bookTmpl.mst', (tmpl) => this._contentTmpl = tmpl);

            return dfd;
        }

        constructor(private container: JQuery) {
            this.bindEvents();
            this.refresh();
        }

        loading() {
            this.container.prepend(`<div id='loader' class="mdl-spinner mdl-js-spinner is-active"></div>`);
        }

        bindEvents() {
            $("button#add").on('click', () => new BookCreationModal().run().done(() => this.refresh()));

            $("#keyword-bar #txtKeyword").keyup((e: any) => {
                if (e.keyCode == 13) this.refresh(e.target.value);
            });

            $('main').on('click', '.mdl-menu__item', (e) => {
                var target = $(e.target),
                    action = target.attr('action'),
                    entityId = target.parent().attr('for');

                switch (action) {
                    case 'U':
                        new BookUpdateModal(entityId).run().done(() => this.refresh());
                        break;
                    case 'D':
                        $.confirm("Delete specific book?",
                            () => this._bookRepo.deleteBook(entityId).done(() => this.refresh()))
                        break;
                    default:
                        throw `Unknow action type: ${action}`;
                }
            });
        }

        render(container: JQuery, data) {
            this.container.find(".book-card").remove();
            this.contentTmpl.done((tmpl) => {
                var rendered = Mustache.render(tmpl, { books: data });
                $('#loader').remove();
                this.container.prepend(rendered);
                var elements = document.getElementsByClassName("book-menu");
                componentHandler.upgradeElements($.map(elements, (val) => val));
            });
        }

        refresh(keyword?: string) {
            $.progress();
            this._bookRepo.getBooks(keyword).done((rlt) => {
                $.progress(false);
                this.render(this.container, rlt.data.books);
            });

            //ES is NEAR REAL TIME Search Engine
            //setTimeout(() => this._bookRepo.getBooks(keyword).done((rlt) => {
            //    $.progress(false);
            //    this.render(this.container, rlt.data.books);
            //}), latency);
        }
    }

    export abstract class BookModal {
        protected _bookRepo = new BookRepo();
        protected _modalDfd = $.Deferred<any>();
        protected _modal: JQuery;
        protected static _tmpl: string;
        protected _failedHandler = (msg: string) => {
            console.log(`Failed to save: ${msg}`);
            uti.Snackbar.show({ message: 'Failed to save...' });
        };

        protected static get tmpl(): JQueryDeferred<string> {
            var dfd = null;
            if (BookModal._tmpl) {
                dfd = $.Deferred<string>();
                dfd.resolve(BookModal._tmpl);
            }
            else
                dfd = $.get('/assets/template/bookModalTmpl.mst', (tmpl) => BookModal._tmpl = tmpl);
            return dfd;
        }

        constructor(private title: string) {
            this._modal = $.modal({
                title: title,
                content: `<div class='mdl-spinner mdl-js-spinner is-active'></div>`,
                cancelable: false,
                negative: {
                    title: 'Dismiss',
                    click: () => {
                        this._modalDfd.reject();
                        return $.Deferred().resolve();
                    }
                },
                positive: {
                    title: "Submit",
                    click: () => this.submit().done(() => this._modalDfd.resolve())
                },
                onLoaded: () => {
                }
            });
        }

        public abstract run(): JQueryPromise<any>;

        getArg(): BookArg {
            return {
                title: $.trim(this._modal.find('#txtTitle').val()),
                desc: $.trim(this._modal.find('#txtDesc').val()),
                author: $.trim(this._modal.find('#txtAuthor').val()),
                publisher: $.trim(this._modal.find('#txtPublisher').val()),
                ISBN: this._modal.find('#txtISBN').val()
            };
        }

        private validate(): boolean {
            var targets = this._modal.find(".mdl-textfield").map((i, ele) => ele["MaterialTextfield"]).toArray();
            return $.grep(targets, (ins: any) => !ins.checkValidity()).length === 0
        }

        protected abstract save(arg: BookArg): JQueryPromise<any>;

        private submit(): JQueryPromise<any> {
            var arg = this.getArg(),
                dfd = $.Deferred<any>();

            if (this.validate()) {
                $.progress();
                this.save(arg)
                    .always((resp) => {
                        $.progress(false);
                        if (resp.error || resp.errors) {
                            dfd.reject();
                            var errMsg = resp.error ? resp.error().responseText : resp.errors[0].message;
                            this._failedHandler(errMsg);
                        } else
                            dfd.resolve();
                    });
            } else
                dfd.reject();
            return dfd;
        }

        protected render(tmpl: string, data?: any) {
            var rendered = (data) ? Mustache.render(tmpl, data) : tmpl;
            this._modal.find('#content').html(rendered);
            var elements = document.getElementsByClassName("mdl-textfield");
            componentHandler.upgradeElements($.map(elements, (val) => val));
        }
    }

    export class BookCreationModal extends BookModal {
        constructor() {
            super("Create New Book");
        }

        run(): JQueryDeferred<any> {
            BookModal.tmpl.done((tmpl) => this.render(tmpl));
            //BookModal.tmpl.done((tmpl) => this.render(tmpl, {
            //    title: this.randomStr(),
            //    desc: this.randomStr(),
            //    author: this.randomStr(),
            //    publisher: this.randomStr(),
            //    ISBN: this.randomInt(100000, 999999),
            //}));

            return this._modalDfd;
        }

        randomStr = () => Math.random().toString(36).substring(7);

        randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        save(arg: BookArg) {
            return this._bookRepo.addBook(arg)
        }
    }

    export class BookUpdateModal extends BookModal {
        constructor(private bookId: string) {
            super("Update Book");
        }

        run(): JQueryDeferred<any> {
            $.when(this._bookRepo.getBook(this.bookId), BookModal.tmpl)
                .done((rlt, tmpl) => this.render(tmpl, rlt[0].data.book))
                .fail(() => alert('Failed to load book detailed'));
            return this._modalDfd;
        }

        save(arg: BookArg) {
            return this._bookRepo.updateBook(this.bookId, arg);
        }
    }

    export class BookRepo {
        private static bookRtnSubCls = '{ id, title, desc, author, publisher, ISBN }';
        getBook(id: string): JQueryPromise<any> {
            return uti.AjaxHelper.Invoke<any>({
                url: '/api/books',
                data: { query: `query bookEntity { book(id: "${id}") ${BookRepo.bookRtnSubCls} }` },
            });
        }

        getBooks(keyword?: string): JQueryPromise<any> {
            var arg = (keyword) ? `(keyword: "${keyword}")` : "";
            return uti.AjaxHelper.Invoke<any>({
                url: '/api/books',
                data: { query: `query bookEntities { books${arg} ${BookRepo.bookRtnSubCls} }` },
            });
        }

        addBook(arg: BookArg): JQueryPromise<any> {
            return uti.AjaxHelper.Invoke<any>({
                url: '/api/books',
                method: 'Post',
                data: JSON.stringify({
                    mutation: `mutation newBook { addBook(title: "${arg.title}", desc: "${arg.desc}", author: "${arg.author}", publisher: "${arg.publisher}", ISBN: ${arg.ISBN}) ${BookRepo.bookRtnSubCls} }`
                })
            });
        }

        updateBook(id: string, arg: BookArg): JQueryPromise<any> {
            return uti.AjaxHelper.Invoke<any>({
                url: '/api/books',
                method: 'Post',
                data: JSON.stringify({
                    mutation: `mutation updateBook { updateBook(id: "${id}",  title: "${arg.title}", desc: "${arg.desc}", author: "${arg.author}", publisher: "${arg.publisher}", ISBN: ${arg.ISBN}) ${BookRepo.bookRtnSubCls} }`
                })
            });
        }

        deleteBook(id: string): JQueryPromise<any> {
            return uti.AjaxHelper.Invoke<any>({
                url: '/api/books',
                method: 'POST',
                data: JSON.stringify({
                    mutation: `mutation deleteBook { deleteBook(id: "${id}") }`
                })
            });
        }
    }

    export interface BookArg {
        title: string;
        desc: string;
        author: string;
        publisher: string;
        ISBN: number;
    }
}

