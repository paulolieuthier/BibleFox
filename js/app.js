var biblefox = new BibleFox();

(function() {
    updateReader();
    updateSelector();
})()

function showChaptersList() {
    document.querySelector('#chapter-selector').className = 'current';
}

function showVersesList() {
    document.querySelector('#verse-selector').className = 'current';
}

function showHome() {
    document.querySelector('#verse-selector').className = 'right';
    document.querySelector('#chapter-selector').className = 'right';
    document.querySelector('#book-selector').className = 'right';
}

function updateShareButton() {
    document.querySelector('#btn-share').disabled = (biblefox.reader.numberOfSelectedVerses <= 0);
}

function updateSelector() {
    var books_ul = document.querySelector('#book-selector-list');
    var chapters_ul = document.querySelector('#chapter-selector-list');
    var verses_ul = document.querySelector('#verse-selector-list');

    var books = biblefox.booksNames();
    for (var book in books) {
        var book_li = document.createElement('li');
        var book_a = document.createElement('a');
        book_a.innerHTML = books[book];
        book_a.dataset.book = book;
        book_li.appendChild(book_a);
        books_ul.appendChild(book_li);

        book_a.addEventListener('click', function() {
            chapters_ul.innerHTML = '';
            var chapters = biblefox.chapters(this.dataset.book);
            showChaptersList();
            for (var chapter in chapters) {
                var chap_li = document.createElement('li');
                var chap_a = document.createElement('a');
                chap_a.innerHTML = chapter;
                chap_a.dataset.book = this.dataset.book;
                chap_a.dataset.chapter = chapter;
                chap_li.appendChild(chap_a);
                chapters_ul.appendChild(chap_li);

                chap_a.addEventListener('click', function() {
                    verses_ul.innerHTML = '';
                    showVersesList();
                    var verses = biblefox.verses(this.dataset.book, this.dataset.chapter);
                    for (var verse in verses) {
                        var verse_li = document.createElement('li');
                        var verse_a = document.createElement('a');
                        verse_a.innerHTML = verse;
                        verse_a.dataset.book = this.dataset.book;
                        verse_a.dataset.chapter = this.dataset.chapter;
                        verse_a.dataset.verse = verse;
                        verse_li.appendChild(verse_a);
                        verses_ul.appendChild(verse_li);

                        verse_a.addEventListener('click', function() {
                            biblefox.goTo(this.dataset.book, this.dataset.chapter, this.dataset.verse);
                            updateReader();
                            showHome();
                        }, false);
                    }
                }, false);
            }
        }, false);
    }
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
    document.querySelector('#reader-book').innerHTML = biblefox.bookName();
    document.querySelector('#reader-chapter').innerHTML = biblefox.chapter();

    var ul = document.querySelector('#reader-verses');
    ul.innerHTML = '';
    var verses = biblefox.verses();
    for (var verse in verses) {
        var li = document.createElement('li');
        var spanNumber = document.createElement('span');
        spanNumber.innerHTML = verse;
        spanNumber.className = 'verse-number';
        var spanText = document.createElement('span');
        spanText.innerHTML = verses[verse];
        spanText.className = 'verse-text';
        li.appendChild(spanNumber);
        li.appendChild(spanText);
        li.setAttribute('id', 'verse');
        li.dataset.verse = verse;
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
    
    updateShareButton();
    
    appendCopyright();

    document.querySelector('#main').scrollTop = 0; 
    document.querySelector('#main').scrollTop = document.querySelector('#verse[data-verse="' + biblefox.verse() + '"]').getBoundingClientRect().top - document.querySelector('#main').getBoundingClientRect().top;
}

