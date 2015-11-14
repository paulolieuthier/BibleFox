define([
    'backbone',
    'handlebars',
    'global',
    'text!templates/selector.hbs',
    'text!templates/selector/chapters.hbs'
], function(Backbone, Handlebars, Global, template, chaptersTmpl) {
   
    return Backbone.View.extend({
       
        el: '#text-selector',
        
        events: {
            'click #books-list a': 'bookClicked',
            'click #chapters-list a': 'chapterClicked',
            'click #bibles-list a': 'bibleClicked',
        },
        
        template: Handlebars.compile(template),
        chaptersTmpl: Handlebars.compile(chaptersTmpl),
        
        ready: false,
        
        initialize: function() {
            this.ready = this.model.ready;
            
            var _this = this;
            this.model.on('ready', function() {
                _this.ready = true;
                _this.render();
            });
        },
        
        render: function() {
            if (this.ready){
                this.el.innerHTML = this.template({
                    books: this.model.booksNames(),
                    bibles: this.model.bibles()
                });
                document.l10n.localizeNode(this.el);

                // select default book
                var bookEl = document.querySelector('#books-list a[data-book="' + this.model.book() + '"]');
                bookEl.className = 'selected';
                document.querySelector('#books-list').scrollTop = bookEl.offsetTop - 30;

                // select default bible
                document.querySelector('#bibles-list a[data-bible="' + this.model.bible() + '"]').className = 'selected';

                // select default chapter
                var _this = this;
                this.loadChapters(this.model.book(), function() {
                    var chapterEl = document.querySelector('#chapters-list a[data-chapter="' + _this.model.chapter() + '"]');
                    chapterEl.className = 'selected';
                    document.querySelector('#chapters-list').scrollTop = chapterEl.offsetTop - 30;
                });
            }
        },

        loadChapters: function(book, callback) {
            var b = Number(book),
                _this = this;

            this.model.chapters(b).then(function(chapters) {
                var ul = document.querySelector('#chapters-list');
                ul.innerHTML = _this.chaptersTmpl({ chapters: chapters });
                ul.scrollTop = 0;

                if (callback !== undefined)
                   callback();
            });
        },

        bookClicked: function(event) {
            var el = event.currentTarget,
                book = Number(el.dataset.book),
                _this = this;

            // remove .selected class from previous selected book and select clicked one
            var prevBook = document.querySelector('#books-list a.selected');
            if (prevBook !== null)
                prevBook.className = '';
            el.className = 'selected';

            this.loadChapters(book);
        },
        
        chapterClicked: function(event) {
            var el = event.currentTarget,
                b = Number(el.dataset.book),
                c = Number(el.dataset.chapter);

            // remove .selected class from previous selected chapter and select clicked one
            var prevChapter = document.querySelector('#chapters-list a.selected');
            if (prevChapter !== null)
                prevChapter.className = '';
            el.className = 'selected';

            this.model.goTo(b, c);
            this.trigger('hideSelector');
        },

        bibleClicked: function(event) {
            var el = event.currentTarget,
                b = el.dataset.bible;

            // remove .selected class from previous selected bible and select clicked on
            var prevBible = document.querySelector('#bibles-list a.selected');
            if (prevBible !== null)
                prevBible.className = '';
            el.className = 'selected';

            var _this = this;
            this.model.changeBible(b).then(function() {
                _this.trigger('hideSelector');
                _this.render();
            });
        },

        reset: function() {
            this.render();
        }
        
    });
    
});
