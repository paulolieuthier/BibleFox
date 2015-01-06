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

        initialize: function() {
            var _this = this;
            this.model.on('ready', function() {
                _this.selectorView = new SelectorView({ model: _this.model });
                _this.selectorView.render();    
                _this.selectorView.on('hideSelector', function() {
                    _this.showHideSelector();
                });
            });
        },

        render: function() {
            this.el.innerHTML = this.template();
        },

        showHideSelector: function() {
            document.querySelector('#index > brick-deck').nextCard();
        }

    });
});
