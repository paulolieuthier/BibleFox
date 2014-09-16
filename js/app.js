var biblefox;

document.addEventListener('DOMContentLoaded', function() {
    biblefox = new BibleFox(function() {
        updateReader();
        updateSelector();
    });
});

function updateShareButton() {
    document.querySelector('#btn-share').disabled = (biblefox.reader.numberOfSelectedVerses <= 0);
}

function updateSelectorHeader(book, chapter) {
    var h1 = document.querySelector('#text-selector > header h1');
    biblefox.bookName(book).then(function(title) {
        h1.innerHTML = title;
        if (chapter !== undefined)
            h1.innerHTML = h1.innerHTML + ' ' + chapter;
    });
}

function updateSelector() {
    var books_ul = document.querySelector('#book-selector-list');
    var chapters_ul = document.querySelector('#chapter-selector-list');
    var verses_ul = document.querySelector('#verse-selector-list');

    biblefox.booksNames().then(function(books) {
        for (var i = 0; i < books.length; i++) {
            var book_li = document.createElement('li');
            var book_a = document.createElement('a');
            book_a.innerHTML = books[i];
            book_a.dataset.book = i + 1;
            book_li.appendChild(book_a);
            books_ul.appendChild(book_li);

            book_a.addEventListener('click', function() {
                chapters_ul.innerHTML = '';
                var book = this.dataset.book;
                updateSelectorHeader(book);
                biblefox.chapters(book).then(function(chapters) {
                    showChaptersList();
                    for (var j = 0; j < chapters.length; j++) {
                        var chap_li = document.createElement('li');
                        var chap_a = document.createElement('a');
                        chap_a.innerHTML = chapters[j];
                        chap_a.dataset.book = book;
                        chap_a.dataset.chapter = j + 1;
                        chap_li.appendChild(chap_a);
                        chapters_ul.appendChild(chap_li);

                        chap_a.addEventListener('click', function() {
                            verses_ul.innerHTML = '';
                            book = this.dataset.book;
                            var chapter = this.dataset.chapter;
                            updateSelectorHeader(book, chapter);
                            biblefox.verses(book, chapter).then(function(verses) {
                                showVersesList();
                                for (var k = 0; k < verses.length; k++) {
                                    var verse_li = document.createElement('li');
                                    var verse_a = document.createElement('a');
                                    verse_a.innerHTML = k + 1;
                                    verse_a.dataset.book = book;
                                    verse_a.dataset.chapter = chapter;
                                    verse_a.dataset.verse = k + 1;
                                    verse_li.appendChild(verse_a);
                                    verses_ul.appendChild(verse_li);

                                    verse_a.addEventListener('click', function() {
                                        biblefox.goTo(this.dataset.book, this.dataset.chapter, this.dataset.verse);
                                        updateReader();
                                        showHome();
                                    }, false);
                                }
                            });
                        }, false);
                    }
                });
            }, false);
        }
    });
}

function appendCopyright() {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = 'http://almeidarecebida.org';
    a.target = '_blank';
    a.innerHTML = 'Almeida Recebida &copy;'
    li.appendChild(a);
    li.className = 'copyright'
    document.querySelector('#reader-verses').appendChild(li);
}

function updateReader() {
    // main page
    biblefox.bookName().then(function(title) {
        document.querySelector('#reader-book').innerHTML = title;
    });
    document.querySelector('#reader-chapter').innerHTML = biblefox.chapter();
    
    var ul = document.querySelector('#reader-verses');
    ul.innerHTML = '';
    biblefox.verses().then(function(verses) {
        document.querySelector('#main-progress').className = 'invisible';
        document.querySelector('#reader-verses').className = '';
        
        for (var i = 0; i < verses.length; i++) {
            var li = document.createElement('li');
            var spanNumber = document.createElement('span');
            spanNumber.innerHTML = i + 1;
            spanNumber.className = 'verse-number';
            var spanText = document.createElement('span');
            spanText.innerHTML = verses[i];
            spanText.className = 'verse-text';
            li.appendChild(spanNumber);
            li.appendChild(spanText);
            li.setAttribute('id', 'verse');
            li.dataset.verse = i + 1;
            ul.appendChild(li);

            li.addEventListener('click', function(event) {
                if (this.className === 'selected') {
                    this.className = '';
                    biblefox.reader.numberOfSelectedVerses--;
                } else {
                    this.className = 'selected';
                    biblefox.reader.numberOfSelectedVerses++;
                }

                updateShareButton();
            });
        }
    
        appendCopyright();
        updateShareButton();

        document.querySelector('#main').scrollTop = 0; 
        document.querySelector('#main').scrollTop = document.querySelector('#verse[data-verse="' + biblefox.verse() + '"]').getBoundingClientRect().top - document.querySelector('#main').getBoundingClientRect().top;
    });
}