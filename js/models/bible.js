define(['backbone', 'database'], function(Backbone, Database) {
    'use strict';
    
    return Backbone.Model.extend({
        
        allBooks: null,
        
        ready: false,

        reader: {
            book: localStorage.getItem('last-book') !== null ? Number(localStorage.getItem('last-book')) : 1,
            chapter: localStorage.getItem('last-chapter') !== null ? Number(localStorage.getItem('last-chapter')) : 1,
            verse: localStorage.getItem('last-verse') !== null ? Number(localStorage.getItem('last-verse')) : 1,
        },
        
        initialize: function() {
            var _this = this
            Database.initialize('bibles/database.sqlite').then(function() {
                _this.ready = true;
                
                return new Promise(function(fulfill, reject) {
                    Database.books().then(function(books) {
                        _this.allBooks = books;
                        fulfill();
                    });
                });
            }).then(function() {
                _this.trigger('ready');
            });
        },
        
        bibleName: function() {
            // TODO: Remove this hardcoded value
            return "Almeida Recebida";
        },
        
        booksNames: function() {
            return this.allBooks;
        },
        
        bookName: function(book) {
            var b = book !== undefined ? Number(book) : this.reader.book;
            return this.allBooks[b];
        },
        
        chapters: function(book) {
            var b = book !== undefined ? Number(book) : this.reader.book;
            return Database.chapters(b);
        },
        
        chapter: function() {
            return this.reader.chapter;
        },
        
        verses: function(data) {
            var b = data.book !== undefined ? Number(data.book) : this.reader.book,
                c = data.chapter !== undefined ? Number(data.chapter) : this.reader.chapter;

            return Database.verses(b, c);
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
            
            this.reader.chaptersCache = null;
            this.reader.versesCache = null;
            
            this.trigger('changed');

            localStorage.setItem('last-book', this.reader.book);
            localStorage.setItem('last-chapter', this.reader.chapter);
            localStorage.setItem('last-verse', this.reader.verse);
        },
        
        nextChapter: function() {
            var _this = this,
                book = this.reader.book,
                chapter = this.reader.chapter;
            
            Database.chapterExists(book, chapter + 1).then(function(exists) {
                if (exists)
                    _this.goTo(book, chapter + 1);
                else
                    _this.goTo(book + 1, 1);
            });
        },
        
        previousChapter: function() {
            var _this = this,
                book = this.reader.book,
                chapter = this.reader.chapter;
            
            Database.chapterExists(book, chapter - 1).then(function(exists) {
                if (exists)
                    _this.goTo(book, chapter - 1);
                else
                    Database.lastChapter(book - 1).then(function(lastChapter) {
                       _this.goTo(book - 1, lastChapter);
                    });
            });
        }
        
    });
});
