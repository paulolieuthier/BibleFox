
document.querySelector('#btn-book-selector').addEventListener('click', function() {
    document.querySelector('#book-selector').className = 'current';
});
document.querySelector('#btn-book-selector-back').addEventListener('click', function() {
    document.querySelector('#book-selector').className = 'right';
});
document.querySelector('#btn-chapter-selector-back').addEventListener('click', function() {
    document.querySelector('#chapter-selector').className = 'right';
});
document.querySelector('#btn-verse-selector-back').addEventListener('click', function() {
    document.querySelector('#verse-selector').className = 'right';
});

document.querySelector('#btn-prev-chapter').addEventListener('click', function() {
    if (biblefox.previousChapter())
        updateReader();
});

document.querySelector('#btn-next-chapter').addEventListener('click', function() {
    if (biblefox.nextChapter())
        updateReader();
});

var home_btns = document.querySelectorAll('#btn-home');
for (var i = 0; i < home_btns.length; i++) {
    home_btns[i].addEventListener('click', function() {
        showHome();
    });
}

document.querySelector('#btn-share').addEventListener('click', function() {
    var text = "";
    var address = "";
    
    var selected_verses = document.querySelectorAll('#verse.selected');
    for (var i = 0; i < selected_verses.length; i++) {
        if (text != "")
            text = text + " ";
        text = text + selected_verses[i].querySelector('.verse-text').innerHTML;
        
        if (address != "")
            address = address + ",";
        address = address + selected_verses[i].dataset.verse;
    }
    
    text = text + "\n-- " + biblefox.bookName() + " " + biblefox.chapter() + ":" + address;
    
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