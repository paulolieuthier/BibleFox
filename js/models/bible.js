define(['backbone', 'database'], function(Backbone, Database) {
    'use strict';
    
    return Backbone.Model.extend({
        
        allBibles: null,
        allBooks: null,
        bibleTitle: '',
        
        ready: false,

        reader: {
            bible: localStorage.getItem('last-bible') !== null ? Number(localStorage.getItem('last-bible')) : 1,
            book: localStorage.getItem('last-book') !== null ? Number(localStorage.getItem('last-book')) : 1,
            chapter: localStorage.getItem('last-chapter') !== null ? Number(localStorage.getItem('last-chapter')) : 1,
            verse: localStorage.getItem('last-verse') !== null ? Number(localStorage.getItem('last-verse')) : 1,
        },
        
        initialize: function() {
            var _this = this
            Database.initialize('bibles/database.sqlite').then(function() {
                _this.ready = true;
                return _this.reloadBooks();
            }).then(function() {
                return new Promise(function(fulfill, reject) {
                    Database.bibles().then(function(bibles) {
                        _this.allBibles = bibles;
                        fulfill();
                    });
                });
            }).then(function() {
                _this.trigger('ready');
            });
        },
        
        bibleName: function() {
            var bibles = this.bibles();
            var length = bibles.length;
            for (var i = 0; i < length; i++)
                if (bibles[i].ID === this.bible())
                    return bibles[i].Title;
            return "";
        },

        bible: function() {
            return this.reader.bible;
        },

        bibles: function() {
            return this.allBibles;
        },

        changeBible: function(bible) {
            var b = bible !== undefined ? Number(bible) : 1;

            if (b < 1 || b > 66)
                return;

            this.reader.bible = b;
            this.trigger('changed');
            localStorage.setItem('last-bible', this.reader.bible);

            return this.reloadBooks(b);
        },

        reloadBooks: function(bible) {
            var _this = this;
            return new Promise(function(fulfill, reject) {
                Database.books(_this.reader.bible).then(function(books) {
                    _this.allBooks = books;
                    fulfill();
                });
            });
        },

        booksNames: function() {
            return this.allBooks;
        },

        bookName: function(book) {
            var b = book !== undefined ? Number(book) : this.reader.book;
            return this.allBooks[b];
        },

        book: function() {
            return this.reader.book;
        },

        chapters: function(book) {
            var b = book !== undefined ? Number(book) : this.reader.book;
            return Database.chapters(this.reader.bible, b);
        },

        chapter: function() {
            return this.reader.chapter;
        },

        verses: function(data) {
            var b = data.book !== undefined ? Number(data.book) : this.reader.book,
            c = data.chapter !== undefined ? Number(data.chapter) : this.reader.chapter;

            return Database.verses(this.reader.bible, b, c);
        },

        verse: function() {
            return this.reader.verse;
        },

        goTo: function(book, chapter, verse) {
            var b = book !== undefined ? Number(book) : 1,
            c = chapter !== undefined ? Number(chapter) : 1,
            v = verse !== undefined ? Number(verse) : 1;

            if (b < 1 || b > 66)
                return;

            this.reader.book = b;
            this.reader.chapter = c;
            this.reader.verse = v;

            this.trigger('changed');

            localStorage.setItem('last-book', this.reader.book);
            localStorage.setItem('last-chapter', this.reader.chapter);
            localStorage.setItem('last-verse', this.reader.verse);
        },

        nextChapter: function() {
            var _this = this,
                bible = this.reader.bible,
                book = this.reader.book,
                chapter = this.reader.chapter;

            Database.chapterExists(bible, book, chapter + 1).then(function(exists) {
                if (exists)
                    _this.goTo(book, chapter + 1);
                else
                    _this.goTo(book + 1, 1);
            });
        },

        previousChapter: function() {
            var _this = this,
                bible = this.reader.bible,
                book = this.reader.book,
                chapter = this.reader.chapter;

            Database.chapterExists(bible, book, chapter - 1).then(function(exists) {
                if (exists)
                    _this.goTo(book, chapter - 1);
                else
                    Database.lastChapter(bible, book - 1).then(function(lastChapter) {
                        _this.goTo(book - 1, lastChapter);
                    });
            });
        }

    });
});
