'use strict';

var /* * Libraries * */
    /// Powers our app 
    express = require('express'),
    /// To output log messages
    logger = require('../middleware/logger/'),
    /// To send emails using nodemailer
    nodemailer = require('../middleware/nodemailer/'),
    /// For collection utilities
    _ = require('lodash'),
    
    /* * Application Data * */
    configuration = null,
    routeKeys = null,

    /* * Application Middleware * */
    authentication = require('./authentication'),
    routes = require('./routes'),
    store = require('./store'),

    /* * Main application * */
    app = express();

function configureQuasiApp(_configuration) {
    let startupMessage = 'Configuring QUASI App';
    
    if(!_configuration) {
        logger.logError('No configuration, cannot create QUASI app without configuration');
        return;
    }
    
    configuration = _configuration;
    routeKeys = _.map(configuration.routes, 'route'),
    
    /********** Set up application and routes **********/
    logger.logSuccess(startupMessage);

    // Turn on pretty formatted errors
    app.locals.pretty = true;

    app.use(authentication.initialize(configuration));
    app.use(store.initialize(configuration));
    app.use(routes.initialize(configuration));

    /********** Custom code **********/    
    /// TODO: put custom code into seperate file and load it here
    /// TODO: put route in configuration (this is a REMNANT)
    /*app.post('/admin/save', ensureAuthenticated, function(req, res){
        saveFile(JSON.stringify(req.body, null, 2), "content/" + req.query.location);
    });*/
   
    logger.logSuccess("Configuration Successful");
}

function run(port) {
    port = process.env.PORT || port;
    
    if(false == port) {
        port = 8080;
    }

    // Start the app and give success logger
    app.listen(port, function () {
        logger.logSuccess("App listening on: http://localhost:" + port);
    });
}

module.exports = {
    run: run,
    configure: configureQuasiApp
}