function showHome() {
    document.querySelector('#text-selector').className = 'right';
    document.querySelector('#text-selector-tabs [role="presentation"] a[aria-selected="true"]').setAttribute('aria-selected', false);
    document.querySelector('#books-tab-btn').setAttribute('aria-selected', true);
    document.querySelector('#chapters-tab-btn').setAttribute('aria-disabled', true);
    document.querySelector('#verses-tab-btn').setAttribute('aria-disabled', true);
}

function showChaptersList() {
    document.querySelector('#chapters-tab-btn').setAttribute('aria-disabled', false);
    document.querySelector('#chapters-tab-btn').click();
}

function showVersesList() {
    document.querySelector('#verses-tab-btn').setAttribute('aria-disabled', false);
    document.querySelector('#verses-tab-btn').click();
}

document.addEventListener('DOMContentLoaded', function() {
    // verse selector
    document.querySelector('#btn-text-selector').addEventListener('click', function() {
        document.querySelector('#text-selector').className = 'current';
        updateSelectorHeader(biblefox.reader.book, biblefox.reader.chapter);
    });
    document.querySelector('#btn-selector-back').addEventListener('click', showHome);

    // next and prev arrows
    document.querySelector('#btn-prev-chapter').addEventListener('click', function() {
        biblefox.previousChapter().then(function() {
            updateReader();
        });
    });
    document.querySelector('#btn-next-chapter').addEventListener('click', function() {
        biblefox.nextChapter().then(function() {
            updateReader(); 
        });
    });

    // tabs
    [].forEach.call(document.querySelectorAll('#text-selector-tabs [role="presentation"] a'), function(a) {
        a.addEventListener('click', function(event) {
            event.preventDefault();
            document.querySelector('#text-selector-tabs [role="presentation"] a[aria-selected="true"]').setAttribute('aria-selected', false);
            a.setAttribute('aria-selected', true);
            
            if (a.getAttribute('id') === 'books-tab-btn') {
                document.querySelector('#chapters-tab-btn').setAttribute('aria-disabled', true);
                document.querySelector('#verses-tab-btn').setAttribute('aria-disabled', true);
            } else if (a.getAttribute('id') === 'chapters-tab-btn') {
                document.querySelector('#verses-tab-btn').setAttribute('aria-disabled', true);
            }
        });
    });
    

    // sharing activity
    document.querySelector('#btn-share').addEventListener('click', function() {
        var text = "";
        var address = "";

        [].forEach.call(document.querySelectorAll('#verse.selected')), function(el) {
            if (text != "")
                text = text + " ";
            text = text + el.querySelector('.verse-text').innerHTML;

            if (address != "")
                address = address + ",";
            address = address + el.dataset.verse;
        }
        
        biblefox.bookName().then(function(title) {
            text = text + "\n-- " + title + " " + biblefox.chapter() + ":" + address;

            var a = new MozActivity({
                name: 'new',
                data: {
                    url: "mailto:?subject=Versículo&body=" + encodeURI(text), // for emails,
                    body: text, // for SMS
                    number: "", // empty number for SMS
                    type: [
                        "websms/sms", "mail"
                    ]
                }
            });
        });
    });
});