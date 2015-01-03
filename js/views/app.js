define([
    'backbone',
    'handlebars',
    'global',
    'text!templates/app.hbs',
    'views/selector'
], function(Backbone, Handlebars, Global, template, SelectorView) {
    
    return Backbone.View.extend({

        el: 'body',

        template: Handlebars.compile(template),

        events: {
            'click #btn-text-selector': 'showHideSelector'
        },

        model: null,
        
        selectorView: null,
        textBeingSelected: false,

        initialize: function() {
            var _this = this;
            this.model.on('ready', function() {
                _this.updateTextAddress();
                _this.selectorView = new SelectorView({ model: _this.model });
                _this.selectorView.render();    
                _this.selectorView.on('hideSelector', function() {
                    _this.textBeingSelected = false;
                    _this.showHideSelector();
                });
                _this.selectorView.on('textBeingSelected', function(book, chapter) {
                    _this.textBeingSelected = true;
                    _this.updateTextAddress(book, chapter);
                });
            });
            this.model.on('changed', function() {
                _this.updateTextAddress();
            });
        },

        render: function() {
            this.el.innerHTML = this.template();
        },

        updateTextAddress: function(book, chapter) {
            // if no parameter is valid, get from current text
            // if only book is valid, show only the book name
            var b = book !== undefined ? this.model.bookName(book) : this.model.bookName(),
                c = chapter !== undefined ? chapter : (book !== undefined ? '' : this.model.chapter());

            document.querySelector('#current-book').innerHTML = b;
            document.querySelector('#current-chapter').innerHTML = c;
        },

        showHideSelector: function() {
            // if text was still being selected (the user gave up) reset selector and address
            if (this.textBeingSelected) {
                this.textBeingSelected = false;
                this.selectorView.reset();
                this.updateTextAddress();
            }
            document.querySelector('#index > brick-deck').nextCard();
        }

    });
});
