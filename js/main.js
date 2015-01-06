require.config({
    baseUrl: 'js/',
    paths: {
        jquery: '../bower_components/zepto/zepto.min',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore-min',
        handlebars: '../bower_components/handlebars/handlebars.min',
        text: '../bower_components/requirejs-text/text',
        sql: '../bower_components/sql/js/sql'
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

require(['backbone', 'underscore', 'global', 'router'], function(Backbone, _, Global, Router) {
    Global.router = new Router();

    document.addEventListener('WebComponentsReady', function() {
        console.log('web components ready');
        Global.router.start();
        Backbone.history.start();
    });
});
