/// <reference path="../tsd/_references.d.ts" />
declare module com.eddie.example {
    class BookApp {
        private container;
        private _bookRepo;
        private _contentTmpl;
        private contentTmpl;
        constructor(container: JQuery);
        loading(): void;
        bindEvents(): void;
        render(container: JQuery, data: any): void;
        refresh(keyword?: string): void;
    }
    abstract class BookModal {
        private title;
        protected _bookRepo: BookRepo;
        protected _modalDfd: JQueryDeferred<any>;
        protected _modal: JQuery;
        protected static _tmpl: string;
        protected _failedHandler: (msg: string) => void;
        protected static tmpl: JQueryDeferred<string>;
        constructor(title: string);
        abstract run(): JQueryPromise<any>;
        getArg(): BookArg;
        private validate();
        protected abstract save(arg: BookArg): JQueryPromise<any>;
        private submit();
        protected render(tmpl: string, data?: any): void;
    }
    class BookCreationModal extends BookModal {
        constructor();
        run(): JQueryDeferred<any>;
        randomStr: () => string;
        randomInt: (min: any, max: any) => any;
        save(arg: BookArg): JQueryPromise<any>;
    }
    class BookUpdateModal extends BookModal {
        private bookId;
        constructor(bookId: string);
        run(): JQueryDeferred<any>;
        save(arg: BookArg): JQueryPromise<any>;
    }
    class BookRepo {
        private static bookRtnSubCls;
        getBook(id: string): JQueryPromise<any>;
        getBooks(keyword?: string): JQueryPromise<any>;
        addBook(arg: BookArg): JQueryPromise<any>;
        updateBook(id: string, arg: BookArg): JQueryPromise<any>;
        deleteBook(id: string): JQueryPromise<any>;
    }
    interface BookArg {
        title: string;
        desc: string;
        author: string;
        publisher: string;
        ISBN: number;
    }
}
