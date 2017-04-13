var router = require('express').Router(),
    /// For collection utilities
    _ = require('lodash'),
    redis   = require("redis"),
    client = null,
    /// For receiving and processing post data
    bodyparser = require('body-parser'),
    /// Simple session middleware for express
    session = require('express-session'),
    redisStore = require('connect-redis')(session);

function initialize(configuration) {

    app.use(bodyparser.json());

    client  = redis.createClient(),

    router.use(session({
        secret: configuration.secret,
        // create new redis store.
        store: new redisStore({ 
            host: configuration.host || 'localhost', 
            port: configuration.port || 6379, 
            client: client,
            ttl :  260}),
        saveUninitialized: configuration.saveUninitialized || false,
        resave: configuration.resave || false
    }));
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({extended: true}));

    return router;
}

module.exports = {
    initialize: initialize,
    client = client
}