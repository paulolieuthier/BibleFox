define(['sql'], function(SQL) {
    'use strict';

    return {

        db: null,

        initialize: function(path) {
            var _this = this;

            return new Promise(function(fulfill, reject) {
                var httpReq = new XMLHttpRequest();
                httpReq.open("GET", path, true);
                httpReq.responseType = 'arraybuffer';
                httpReq.onload = function(e) {
                    var uInt8Array = new Uint8Array(this.response);
                    _this.db = new SQL.Database(uInt8Array);
                    fulfill();
                };
                httpReq.send(); 
            }).then(function() {
                console.log('database loaded');
                return;
            });
        },

        bibleName: function(bible) {
            var _this = this;
            return new Promise(function(fulfill, reject) {
                _this.db.each('SELECT * FROM Bibles WHERE ID = $bible', { $bible: bible }, function(row) {
                    fulfill(row.Title);
                });
            });
        },

        books: function(bible) {
            var _this = this;
            return new Promise(function(fulfill, reject) {
                var books = {};
                _this.db.each('SELECT * FROM Books WHERE Bible = $bible ORDER BY "Index"', { $bible: bible }, function(row) {
                    books[Number(row.Index)] = row.Title;
                }, function() {
                    fulfill(books);
                });
            });
        },

        chapters: function(bible, book) {
            var _this = this;
            return new Promise(function(fulfill, reject) {
                var chapters = [];
                var stmt = _this.db.prepare('SELECT Book, Chapter FROM Verses WHERE Bible = ? AND Book = ? GROUP BY Book, Chapter');
                stmt.bind([bible, book]);
                while (stmt.step())
                    chapters.push(stmt.getAsObject());
                stmt.free();
                fulfill(chapters);
            })
        },

        verses: function(bible, book, chapter) {
            var _this = this;
            return new Promise(function(fulfill, reject) {
                var verses = [];
                var stmt = _this.db.prepare('SELECT * FROM Verses WHERE Bible = ? AND Book = ? AND Chapter = ?');
                stmt.bind([bible, book, chapter]);
                while (stmt.step())
                    verses.push(stmt.getAsObject());
                fulfill(verses);
                stmt.free();
            });
        },

        chapterExists: function(bible, book, chapter) {
            var _this = this;
            return new Promise(function(fulfill, reject) {
                var stmt = _this.db.prepare('SELECT COUNT(*) FROM Verses WHERE Bible = ? AND Book = ? AND Chapter = ?');
                stmt.bind([bible, book, chapter]);
                stmt.step();
                var result = stmt.get()[0] > 0;
                stmt.free();
                fulfill(result);
            });
        },

        lastChapter: function(bible, book) {
            var _this = this;
            return new Promise(function(fulfill, reject) {
                var stmt = _this.db.prepare('SELECT Chapter FROM Verses WHERE Bible = ? AND Book = ? ORDER BY Chapter DESC LIMIT 1');
                stmt.bind([bible, book]);
                stmt.step();
                var result = stmt.get()[0];
                stmt.free();
                fulfill(result);
            });
        }

    };

});
