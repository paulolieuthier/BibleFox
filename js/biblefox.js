function BibleFox() {
    this.reader = {};
    this.reader.object = bible_ar;
    
    this.reader.numberOfSelectedVerses = 0;

    this.reader.book = localStorage.getItem('last-book') !== null ?
        Number(localStorage.getItem('last-book')) : 1;
    this.reader.chapter = localStorage.getItem('last-chapter') !== null ?
        Number(localStorage.getItem('last-chapter')) : 1;
    this.reader.verse = localStorage.getItem('last-verse') !== null ?
        Number(localStorage.getItem('last-verse')) : 1;
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

    return this.reader.object.bible[b][c];
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

BibleFox.prototype.bookName = function(book) {
    if (typeof book !== "undefined")
        return this.reader.object.books[book];
    else
        return this.reader.object.books[this.reader.book];
};

BibleFox.prototype.bibleTitle = function() {
    return this.reader.object.title;
};

BibleFox.prototype.previousChapter = function() {
    this.reader.numberOfSelectedVerses = 0;
    var c = this.reader.chapter;
    var b = this.reader.book;
    if (typeof this.reader.object.bible[b][c - 1] !== "undefined") {
        this.goTo(b, c - 1);
        return true;
    } else if (typeof this.reader.object.bible[b - 1] !== "undefined") {
        c = 1;
        while (typeof this.reader.object.bible[b - 1][c] !== "undefined")
            c = c + 1;
        c = c - 1;
        this.goTo(b - 1, c);
        return true;
    }

    return false;
};

BibleFox.prototype.nextChapter = function() {
    this.reader.numberOfSelectedVerses = 0;
    var c = this.reader.chapter;
    var b = this.reader.book;
    if (typeof this.reader.object.bible[b][c + 1] !== "undefined") {
        this.goTo(b, c + 1);
        return true;
    } else if (typeof this.reader.object.bible[b + 1] !== "undefined") {
        this.goTo(b + 1, 1);
        return true;
    }

    return false;
};

BibleFox.prototype.booksNames = function() {
    return this.reader.object.books;
};

BibleFox.prototype.chapters = function(book) {
    return this.reader.object.bible[book];
};
