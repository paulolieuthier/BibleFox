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
                this.el.innerHTML = this.template({ books: this.model.booksNames() });
                document.l10n.localizeNode(this.el);
            }
        },
        
        bookClicked: function(event) {
            var book = Number(event.currentTarget.dataset.book),
                _this = this;

            // remove .selected class from previous selected book and select clicked one
            var prevBook = document.querySelector('#books-list a.selected');
            if (prevBook !== null)
                prevBook.className = '';
            event.currentTarget.className = 'selected';

            this.model.chapters(book).then(function(chapters) {
                document.querySelector('#chapters-list').innerHTML = _this.chaptersTmpl({ chapters: chapters });
                document.querySelector('#text-selector #chapters-tab').select();
                document.querySelector('#text-selector #chapters-tab button').disabled = false;
            });
        },
        
        chapterClicked: function(event) {
            var el = event.currentTarget,
                b = Number(el.dataset.book),
                c = Number(el.dataset.chapter);

            // remove .selected class from previous selected chapter and select clicked one
            var prevChapter = document.querySelector('#chapters-list a.selected');
            if (prevChapter !== null)
                prevChapter.className = '';
            event.currentTarget.className = 'selected';

            this.model.goTo(b, c);
            this.trigger('hideSelector');
        },
        
        reset: function() {
            this.render();
        }
        
    });
    
});
