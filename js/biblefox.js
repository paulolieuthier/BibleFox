function BibleFox(callbackFunc) {
    this.database = {};
    this.database.db = null;
    this.objectStore = null;
    
    this.reader = {};
    this.reader.numberOfSelectedVerses = 0;

    this.reader.book = localStorage.getItem('last-book') !== null ?
        Number(localStorage.getItem('last-book')) : 1;
    this.reader.chapter = localStorage.getItem('last-chapter') !== null ?
        Number(localStorage.getItem('last-chapter')) : 1;
    this.reader.verse = localStorage.getItem('last-verse') !== null ?
        Number(localStorage.getItem('last-verse')) : 1;
    
    var biblefox = this;
    
    this.database.open = function() {
        
        var version = 20;
        var neededUpgrade = false;
        var request = indexedDB.open('bibles', version);

        request.onupgradeneeded = function(e) {
            neededUpgrade = true;
            var db = e.target.result;
            e.target.transaction.onerror = biblefox.database.onerror;

            if (db.objectStoreNames.contains('verses'))
                db.deleteObjectStore('verses');
            var versesStore = db.createObjectStore('verses', { keyPath: ['b', 'c', 'v'] });
            versesStore.createIndex('verse', ['b', 'c', 'v'], { unique: true });
            versesStore.createIndex('chapter', ['b', 'c'], { unique: false });
            
            if (db.objectStoreNames.contains('books'))
                db.deleteObjectStore('books');
            var booksStore = db.createObjectStore('books', { keyPath: ['index'] });
            booksStore.createIndex('book', 'index', { unique: true });
            
            var httpReq = new XMLHttpRequest();
            new Promise(function(fulfill, reject) {
                httpReq.open("GET", "bibles/ar.json", true);
                httpReq.onreadystatechange = function() {
                    if (httpReq.readyState === 4 && httpReq.status === 200) {
                        fulfill(JSON.parse(httpReq.responseText));
                    }
                }
                httpReq.send(); 
            }).then(function(bible) {
                var objVerses = db.transaction(['verses'], 'readwrite').objectStore('verses');
                var verses = bible.verses;
                for (var i = 0; i < verses.length; i++)
                    objVerses.add(verses[i]);
                
                var objBooks = db.transaction(['books'], 'readwrite').objectStore('books');
                var books = bible.books;
                for (var i = 0; i < books.length; i++)
                    objBooks.add(books[i]);
                
                biblefox.database.db = db;
                callbackFunc();
            });
        };

        request.onsuccess = function(e) {
            if (!neededUpgrade) {
                biblefox.database.db = e.target.result;
                callbackFunc();
            }
        };

        request.onerror = function(e) {
            biblefox.database.onerror();
        }
    };
    
    this.database.onerror = function(e) {
        console.log('Error: ' + e.target);
    };

    this.database.open();
};

BibleFox.prototype.verses = function(book, chapter) {
    var b, c;

    if (typeof book !== "undefined")
        b = Number(book);
    else
        b = this.reader.book;

    if (typeof chapter !== "undefined")
        c = Number(chapter);
    else
        c = this.reader.chapter;

    var verses = [];
    var obj = this.database.db.transaction('verses', 'readonly').objectStore('verses');
    return new Promise(function(fulfill, reject) {
        obj.index('verse').openCursor(IDBKeyRange.bound([b, c, 1], [b, c, 900])).onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                verses.push(cursor.value.text);
                cursor.continue();
           } else {
               fulfill(verses);
           }
        }
    });
};

BibleFox.prototype.goTo = function(book, chapter, verse) {
    this.reader.book = Number(book);
    this.reader.chapter = Number(chapter);
    this.reader.verse = typeof verse !== "undefined" ? Number(verse) : 1;

    localStorage.setItem('last-book', this.reader.book);
    localStorage.setItem('last-chapter', this.reader.chapter);
    localStorage.setItem('last-verse', this.reader.verse);
    
    this.reader.numberOfSelectedVerses = 0;
};

BibleFox.prototype.chapter = function() {
    return this.reader.chapter;
};

BibleFox.prototype.verse = function() {
    return this.reader.verse;
};

BibleFox.prototype.previousChapter = function() {
    this.reader.numberOfSelectedVerses = 0;
    var b = this.reader.book;
    var c = this.reader.chapter;
    
    var biblefox = this;
    var obj = this.database.db.transaction('verses', 'readonly').objectStore('verses');
    return new Promise(function(fulfill, reject) {
        obj.index('verse').get(IDBKeyRange.only([b, c - 1, 1])).onsuccess = function(event) {
            if (this.result !== undefined) {
                biblefox.goTo(b, c - 1);
                fulfill();
            } else if (b > 1) { // FIXME: This is ugly
                biblefox.chapters(b - 1).then(function(chapters) {
                    biblefox.goTo(b - 1, chapters.length);
                    fulfill();
                });
            }
       };
    });
};

BibleFox.prototype.nextChapter = function() {
    this.reader.numberOfSelectedVerses = 0;
    var b = this.reader.book;
    var c = this.reader.chapter;
    
    var biblefox = this;
    var obj = this.database.db.transaction('verses', 'readonly').objectStore('verses');
    return new Promise(function(fulfill, reject) {
        obj.index('verse').get(IDBKeyRange.only([b, c + 1, 1])).onsuccess = function(event) {
            if (this.result !== undefined)
                biblefox.goTo(b, c + 1);
            else if (b < 66) // FIXME: This is ugly
                biblefox.goTo(b + 1, 1);
            fulfill();
        };
    });
};

BibleFox.prototype.bookName = function(book) {
    var b = (book !== undefined) ? Number(book) : this.reader.book;
    var obj = this.database.db.transaction(['books'], 'readonly').objectStore('books');
    return new Promise(function(fulfill, reject) {
        obj.index('book').get(IDBKeyRange.only(b)).onsuccess = function(event) {
            if (this.result !== undefined)
                fulfill(this.result.title);
        };
    });
};

BibleFox.prototype.booksNames = function() {
    var books = [];
    var obj = this.database.db.transaction(['books'], 'readonly').objectStore('books');
    return new Promise(function(fulfill, reject) {
        obj.index('book').openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                books.push(cursor.value.title);
                cursor.continue();
           } else {
               fulfill(books);
           }
        };
    });
};

BibleFox.prototype.chapters = function(book) {
    var b = Number(book);
    var chapters = [];
    var obj = this.database.db.transaction('verses', 'readonly').objectStore('verses');
    return new Promise(function(fulfill, reject) {
        obj.index('verse').openCursor(IDBKeyRange.bound([b, 1, 1], [b, 900, 900])).onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                if (chapters[chapters.length - 1] !== cursor.value.c) {
                    chapters[chapters.length] = cursor.value.c;
                }
                cursor.continue();
            } else {
                fulfill(chapters);
            }
        }
    });
};
