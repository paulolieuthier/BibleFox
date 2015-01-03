require.config({
    baseUrl: 'js/',
    paths: {
        jquery: '../bower_components/zepto/zepto.min',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore-min',
        handlebars: '../bower_components/handlebars/handlebars.min',
        text: '../bower_components/requirejs-text/text'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery']
        }
    }
});

document.addEventListener('WebComponentsReady', function() {
    require(['backbone', 'underscore', 'global', 'router'], function(Backbone, _, Global, Router) {
        Global.eventBus = _.extend({}, Backbone.Events);
        Global.router = new Router();
        Backbone.history.start();
    });
});
