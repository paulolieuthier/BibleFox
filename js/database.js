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
                _this.db.each('select * from bibles where id = $bible', { $bible: bible }, function(row) {
                    fulfill(row.title);
                });
            });
        },

        books: function() {
            var _this = this;
            return new Promise(function(fulfill, reject) {
                var books = {};
                _this.db.each('select * from books', function(row) {
                    books[Number(row.id)] = row.title;
                }, function() {
                    fulfill(books);
                });
            });
        },

        chapters: function(book) {
            var _this = this;
            return new Promise(function(fulfill, reject) {
                var chapters = [];
                var stmt = _this.db.prepare('select book, chapter from verses where book = ? group by chapter');
                stmt.bind([book]);
                while (stmt.step())
                    chapters.push(stmt.getAsObject());
                stmt.free();
                fulfill(chapters);
            })
        },

        verses: function(book, chapter) {
            var _this = this;
            return new Promise(function(fulfill, reject) {
                var verses = [];
                var stmt = _this.db.prepare('select * from verses where book = ? and chapter = ?');
                stmt.bind([book, chapter]);
                while (stmt.step())
                    verses.push(stmt.getAsObject());
                fulfill(verses);
                stmt.free();
            });
        },

        chapterExists: function(book, chapter) {
            var _this = this;
            return new Promise(function(fulfill, reject) {
                var stmt = _this.db.prepare('select count(*) from verses where book = ? and chapter = ?');
                stmt.bind([book, chapter]);
                stmt.step();
                var result = stmt.get()[0] > 0;
                stmt.free();
                fulfill(result);
            });
        },

        lastChapter: function(book) {
            var _this = this;
            return new Promise(function(fulfill, reject) {
                var stmt = _this.db.prepare('select chapter from verses where book = ? order by chapter desc limit 1');
                stmt.bind([book]);
                stmt.step();
                var result = stmt.get()[0];
                stmt.free();
                fulfill(result);
            });
        }

    };

});
