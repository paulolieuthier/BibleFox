define([
    'global',
    'backbone',
    'views/app',
    'views/reader',
    'models/bible'
], function(Global, Backbone, AppView, ReaderView, BibleModel) {
    'use strict';
    
    return Backbone.Router.extend({
        
        bible: new BibleModel(),
        
        appView: null,
        readerView: null,
        
        routes: {
            '': 'reader',
            'reader': 'reader',
        },

        initialize: function() {
            this.appView = new AppView({ model: this.bible });
            this.appView.render();
        },

        reader: function() {
            this.show(new ReaderView({ model: this.bible }));
        },

        show: function(view) {
            if (view == this.currentView)
                return;
            
            if (this.currentView) {
                this.currentView.stopListening();
                this.currentView.undelegateEvents();
            }

            this.currentView = view;
            this.currentView.render();
        }
    });
});
