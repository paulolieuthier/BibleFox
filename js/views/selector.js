define([
    'backbone',
    'handlebars',
    'global',
    'text!templates/selector.hbs'
], function(Backbone, Handlebars, Global, template) {
   
    return Backbone.View.extend({
       
        el: '#text-selector',
        
        events: {
            'click #books-list a': 'bookClicked',
            'click #chapters-list a': 'chapterClicked',
            'click #verses-list a': 'verseClicked'
        },
        
        template: Handlebars.compile(template),
        
        ready: false,
        
        initialize: function() {
            this.ready = this.model.ready;
            
            var _this = this;
            this.model.on('ready', function() {
                _this.ready = true;
                _this.render();
            });
        },
        
        tabs: ['books', 'chapters', 'verses'],
        currentTab: 0,

        previousChapters: [],
        previousVerses: [],
        
        render: function(data) {
            if (this.ready) {
                this.el.innerHTML = this.template({
                    isBooksTab: this.tabs[this.currentTab] === 'books',
                    isChaptersTab: this.tabs[this.currentTab] === 'chapters',
                    isVersesTab: this.tabs[this.currentTab] === 'verses',
                    currentTab: this.currentTab,
                    books: this.model.booksNames(),
                    chapters: data && data.chapters !== undefined ? data.chapters : this.previousChapters,
                    verses: data && data.verses !== undefined ? data.verses : this.previousVerses
                });
                this.previousChapters = data && data.chapters !== undefined ? data.chapters : this.previousChapters;
                this.previousVerses = data && data.verses !== undefined ? data.verses : this.previousVerses;
            }
        },
        
        bookClicked: function(event) {
            var book = Number(event.currentTarget.dataset.book),
                _this = this;

            this.model.chapters(book).then(function(chapters) {
                _this.currentTab = 1;
                _this.render({ chapters: chapters });

                _this.trigger('textBeingSelected', book);
            });
        },
        
        chapterClicked: function(event) {
            var el = event.currentTarget,
                b = Number(el.dataset.book),
                c = Number(el.dataset.chapter),
                _this = this;

            this.model.verses({ book: b, chapter: c }).then(function(verses) {
                _this.currentTab = 2;
                _this.render({ verses: verses });

                _this.trigger('textBeingSelected', b, c);
            });
        },
        
        verseClicked: function(event) {
            var el = event.currentTarget;
            this.model.goTo(el.dataset.book, el.dataset.chapter, el.dataset.verse);
            this.currentTab = 0;
            this.trigger('hideSelector');
        },

        reset: function() {
            this.currentTab = 0;
            this.render();
        }
        
    });
    
});
