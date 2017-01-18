'use strict';

var /* * Libraries * */
    /// Powers our app 
    express = require('express'),
    /// For receiving and processing post data
    bodyparser = require('body-parser'),
    /// For collection utilities
    _ = require('lodash'),
    /// So we can read files from the filesystem
    fs = require('fs'),
    /// To get relative and ultimate paths
    path = require('path'),
    /// To output console messages
    message = require('./vendor/message/'),
    /// To send emails using nodemailer
    nodemailer = require('./vendor/nodemailer/'),
    /// For user authentication
    passport = require('passport'),
    /// For authenticating Google account users
    GoogleOauthJWTStrategy = require('passport-google-oauth-jwt').GoogleOauthJWTStrategy,
    /// Simple session middleware for express
    session = require('express-session'),
    /// For serving a favicon
    favicon = require('serve-favicon'),
    
    /* * Application Data * */
    config = require("./config"),
    routeKeys = _.map(config.routes, 'route'),

    /* * Main application * */
    app = express();

/// Serves template files and files from the static routes
function servePageOrFile(req, res) {
    // DEBUG console.log(chalk.yellow('receiving ' + req.url));
    var lastSlashLocation = (req.url.indexOf('?') == -1) ? req.url.length -1 : req.url.indexOf('?') - 1;

    if(req.url[lastSlashLocation] != '/') {
        var redirect = req.url.substring(0, lastSlashLocation + 1) + '/' + req.url.substring(lastSlashLocation + 1);
        message.logUpdate('redirecting to ' + redirect);
        return res.redirect(redirect);
    }
    var url = req.path.substring(0, req.path.length - 1),
        routeIndex = routeKeys.indexOf(url);
    
    if(routeIndex !== -1) {
        servePage(config.routes[routeIndex], req, res);
    }
    else {
        serveFile(req.path, req, res);
    }
}

// Inserts a string into another string before the single occurance where
function insertBefore(what, where, insert) {
    var split = what.split(where);
    
    return split[0] + insert + where + split[1];
}

// Inserts a string into another string after the single occurance where
function insertAfter(what, where, insert, complication) {
     var split = what.split(where);
        
    if(complication) {
        var afterComplication = split[1].indexOf(complication) + 1,
            complicationResolution = split[1].substr(0, afterComplication);
        
        return split[0] + where + complicationResolution + insert + split[1].substring(afterComplication);
    }
    else {
        return split[0] + where + insert + split[1];
    }
}

function modifyPage(html, window_page_content) {
    var headStartScripts = '', 
        headEndScripts = '', 
        bodyStartScripts = '', 
        bodyEndScripts = '';

    _.forEach(config.scripts, function(script){
        switch(script.location) {
            case "headStart":
                headStartScripts += script.script;
                break;
            case "headEnd":
                headEndScripts += script.script;
                break;
            case "bodyStart":
                bodyStartScripts += script.script;
                break;
            case "bodyEnd":
                bodyEndScripts += script.script;
                break;
        }
    });

    // Remove the sample content for the template if it exists (REMNANT)
    html = html.replace('<script src="./sample.js"></script>', '');

    // Insert the page content to be used for PUREjs
    html = insertBefore(html, '</body>', '<script>window.page.content=' + window_page_content + ';</script>');

    html = insertAfter(html, "<head", headStartScripts, '>');
    html = insertBefore(html, "</head>", headEndScripts);
    html = insertAfter(html, "<body", bodyStartScripts, '>');
    html = insertBefore(html, "</body>", bodyEndScripts);
            
    return html;
}

function servePage(route, req, res) {
    message.logSuccess('route matched page: ' + route.route);

    var page = route.page != "" ? route.page : "index.html",
        html = path.join(__dirname, 'templates/', route.template, '/', page), 
        contentPath = path.join(__dirname, route.content),
        content;

    /// TODO: add serverside PUREjs templating for the <head> of the document
    /// TODO: Cachebusting - append the version of the app to the resource tags (css,js)

    try {
        // Get the html template
        html = fs.readFileSync(html, "utf8");
    } catch(e) {
        message.logError('Error reading html template: ' + e);
        res.status(404).send();
        return;
    }

    try {
        // Get the page data to use in templating
        content = fs.readFileSync(contentPath, "utf8");
    } catch(e) {
        message.logError('Error reading content for template at ' + contentPath + ': ' + e);
        content = "''";
    }

    // Modify the html to include the page content and scripts
    html = modifyPage(html, content);
    
    // Send the html to the browser
    res.write(html);
    res.end();
}

function serveFile(route, req, res) {        
    message.logNotice("static file requested: " + route + req.url);
    var file = req.url = (req.url.indexOf('?') != -1) ? req.url.substring(0, req.url.indexOf('?')) : req.url;
    res.sendFile(path.join(__dirname, route, req.url));
}

function backupFile(target) {
    var backup = target + ".bak";
    
    fs.writeFileSync(backup, fs.readFileSync(target));
}

function saveFile(contents, target) {
    backupFile(target);
    
    fs.writeFile(target, contents, function(err) {
        if(err) {
            message.logError(err);
        }

        message.logSuccess("Successfully saved file to " + target);
    }); 
}

// route middleware to make sure a user is authenticated
function ensureAuthenticated(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the login page
    message.logNotice("saving " + req.url + " to redirect to after authentication");
    req.session.redirectTo = req.url;
    res.redirect('/login');
}

function configureQuasiApp() {
    /********** Set up passport methods **********/
    
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    /********** Set up application and routes **********/

    // Turn on pretty formatted errors
    app.locals.pretty = true;

    // Configure sessions and set authentication keys for each authentication method
    _.forEach(config.auth, function(authentication) {
        app.use(session({
            secret: authentication.session,
            resave: false,
            saveUninitialized: false
        }));
        switch(authentication.name) {
            case "google": 
                passport.use(new GoogleOauthJWTStrategy({
                    clientId: authentication.clientID,
                    clientSecret: authentication.clientSecret
                }, function verify(token, info, refreshToken, done) {
                    _.find(config.users, function(user) {
                        if(user.id == info.email) {
                            message.logInfo("User " + info.email + " authenticted using google");
                            done(null, { email: info.email });
                        }
                    });
                }));
                break;
        }
    });
    app.use(bodyparser.json());
    app.use(passport.initialize());
    app.use(passport.session());

    /// TODO: put route in configuration (this is a REMNANT)
    /*app.post('/admin/save', ensureAuthenticated, function(req, res){
        saveFile(JSON.stringify(req.body, null, 2), "content/" + req.query.location);
    });*/

    // Use the first route as the landing for the site
    app.get("", function(req, res) {
        res.redirect(routeKeys[0] + '/');
    });

    // Configure routes
    _.forEach(config.routes, function(route) {
        var type = "dynamic";

        // If the route is static
        if(route.static === true) {
            /// TODO: should static routes be protectable?
            // Honestly I cannot figure this out
            // Use static middleware without defined route
            app.use(express.static(path.join(__dirname, route.route)));
            // Define route and use sendFile on the requested path
            app.use(route.route, function(req, res) {
                serveFile(route.route, req, res);
            });   
            type = "static";
        }
        // If this is a special route of type favicon
        else if(route.favicon === true) {
            app.use(favicon(__dirname + route.content));
            type = "favicon";
        }
        // If the user must be authenticated for this route
        else if(route.protected === true) {
            // servePageOrFile at this route with authentication
            app.get(route.route, ensureAuthenticated, servePageOrFile); 
            // Include the template folder
            app.use(route.route, ensureAuthenticated, function(req, res) {
                serveFile('templates/' + route.template, req, res);
            }); 
            type += "-protected";
        }
        else {
            // servePageOrFile at this route
            app.get(route.route, servePageOrFile); 
            // Include the template folder as static route
            app.use(route.route, function(req, res) {
                serveFile('templates/' + route.template, req, res);
            }); 
        }
        message.logInfo("Configured " + type + " route: " + route.route);
    });

    // Configure authentication routes
    _.forEach(config.auth, function(authentication) {
        message.logInfo("Configuring authentication: " + authentication.name);

        // request google login
        app.get( authentication.authRoute, passport.authenticate( authentication.session, 
            { callbackUrl: authentication.callbackURL, scope: authentication.scope }));

        // handle google callback
        app.get( authentication.callbackRoute, 
        passport.authenticate( authentication.session, { callbackUrl: authentication.callbackURL}),
        function(req, res) {
            var redirectTo = req.session.redirectTo;
            delete req.session.redirectTo;
            res.redirect(redirectTo);
        });
    });

    // Set default route to the first site as well
    app.get('*', function(req, res) {
        res.redirect(routeKeys[0] + '/');
    });

    message.logSuccess("Configuration Successful");
}

function run(port) {
    if(process.env.PORT) {
        port = process.env.PORT;
    }
    else if(!port) {
        port = 8080;
    }

    // Start the app and give success message
    app.listen(port, function () {
        message.logSuccess("App listening on: http://localhost:" + port);
    });
}

module.exports = {
    run: run,
    configure: configureQuasiApp
}