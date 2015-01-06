define([
    'backbone',
    'handlebars',
    'global',
    'text!templates/reader.hbs'
], function(Backbone, Handlebars, Global, template) {
    
    return Backbone.View.extend({

        el: '#main',

        template: Handlebars.compile(template),

        events: {
            'click li.verse': 'verseClicked',
            'click #btn-next-chapter': 'nextChapter',
            'click #btn-prev-chapter': 'prevChapter',
            'click #btn-search': 'search',
            'click #btn-share': 'share'
        },
        
        ready: false,
        
        numberOfSelectedVerses: 0,

        initialize: function() {
            var _this = this;
            
            this.model.on('ready changed', function() {
                _this.ready = true;
                _this.render();
            });
        },

        render: function() {
            if (!this.ready)
               return;

            var _this = this;
            this.model.verses({}).then(function(verses) {
                _this.el.innerHTML = _this.template({
                    verses: verses,
                    bibleName: _this.model.bibleName()
                });

                document.querySelector('#current-book').innerHTML = _this.model.bookName();
                document.querySelector('#current-chapter').innerHTML = _this.model.chapter();
            });
        },

        verseClicked: function(event) {
            event.preventDefault();
            var el = event.currentTarget;
            if (el.dataset.selected === "true") {
                this.numberOfSelectedVerses--;
                el.dataset.selected = "false";
            } else {
                this.numberOfSelectedVerses++;
                el.dataset.selected = "true";
            }

            this.updateShareButton();
        },

        nextChapter: function() {
            this.model.nextChapter();
        },

        prevChapter: function() {
            this.model.previousChapter();
        },

        updateShareButton: function() {
            this.el.querySelector('#btn-share').disabled = (this.numberOfSelectedVerses === 0);
        },

        search: function() {
            console.log('search');
        },

        share: function() {
            var text = "";
            var address = '';

            [].forEach.call(document.querySelectorAll('.verse[data-selected="true"]'), function(el) {
                if (text != '')
                    text = text + ' ';
                text = text + el.querySelector('.verse-text').innerHTML;

                if (address != '')
                    address = address + ',';
                address = address + el.dataset.verse;
            });

            address = this.model.bookName() + ' ' + this.model.chapter() + ':' + address;
            text = text + '\n-- ' + address;
            new MozActivity({
                name: 'new',
                data: {
                    url: 'mailto:?subject=Versículo&body=' + encodeURI(text), // for emails,
                    body: text, // for SMS
                    number: '', // empty number for SMS
                    type: [
                        'websms/sms', 'mail'
                    ]
                }
            });
        }

    });
});
