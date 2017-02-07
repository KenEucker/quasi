# Framework
QUASI framework - an express based framework intended to provide all of the features you would need to run a simple webserver from simple configuration files that inform the app how it should serve your html pages, using a DOM structure based templating engine that enables developers to create their templates without a tightly coupled content management system. 

## QUASI configuration
The QUASI framework uses three configuration files for it's simple setup:
* auth.json - defines the authentication methods to use when configuring 'protected' routes.
~~~~ 
{
    "name": "AUTHENTICATION NAME",
    "clientID": "AUTHENTICATION CLIENT ID",
    "clientSecret": "AUTHENTICATION CLIENT SECRET",
    "authRoute": "THE ROUTE TO USE FOR AUTHENTICATION",
    "callbackRoute": "THE ROUTE TO USE FOR AUTHENTICATION CALLBACK",
    "callbackURL": "THE FULLY QUALIFIED PATH TO BE USED WHEN CONFIGURING AUTHENTICATION",
    "session": "THE NAME TO USE FOR THE AUTHENTICATION SESSION",
    "scope": [] - THE SCOPES TO USE WHEN CONFIGURING AUTHENTICATION
} 
~~~~
* routes.json - defines the routes to use for the application.
~~~~ 
{
    "route": "THE PATH OF THE ROUTE TO RESPOND TO",
    "template": "THE NAME OF THE TEMPLATE WITHIN THE /template/ PATH",
    "page": "RELATIVE PATH TO template TO USE FOR THE PAGE (default: index.html)",
    "content": "PATH TO CONTENT .json OBJECT",
    "protected": bool - whether or not to require authentication for this route
    "static": bool - if it is not a dynamic route, and to simply serve the path as is
}
~~~~ 
* scripts.json - defines the scripts to include on each served page that the application will insert: headStart, headEnd, bodyStart, bodyEnd
~~~~ 
{
    "script": "SCRIPT TO INSERT, HTML, THAT CAN BE EITHER RAW JAVASCRIPT OR SOURCE TO FILE",
    "location": "WHERE TO PUT THE TAG"
}
~~~~ 
* users.json - defines the users of the application that will determine who is allowed to be authenticated.
~~~~ 
{
    "id": "EMAIL ADDRESS OF USER TO AUTHENTICATE",
    "role": "CURRENTLY UNUSED"
}
~~~~ 

# Start it up
1. install nodejs
2. run `npm install`
3. run `node index.js`

# Development
Themes can be developed statically, as the paths are translated between served and unserved content.
The flow for developing a theme is to add a few items, including the templating, to get started.

The vendor folder is for global libraries that can be modified from their original source or node_module middleware (minified versions are expected to be original source)

## Using PUREjs templating with the files in the /templates folder
The idea is that you can develop a theme without any of the server tech running with a text editor and verify your work by opening your html files in the browser. To do so the following points are expectations of template development.
\* This assumes that there are no external resources required for your templates.
* Libraries that are more specific to smaller aspects of a template remain in that template's folder
* Static assets that are only used for a specific template may remain in that template's folder. Templates using static assets only specific to that template are expected to use a relative path specific to that template's folder structure.
* Assets that are specific to site content would go into the /assets folder to be used between different templates. These assets are expected to use a path that goes the required levels out of the /templates folder (../../assets)

# Vendors that make this project possible
* purejs (w/jquery)
* express
* passport
* foundation
* nodemailer

# Roadmap
## 1.0.0
### Features 
* common OAUTH2 integrations using javascript web tokens
* route generation and script loading
* everything's a json object (EJO) Editor
* webpack integration
* remoteStorage integration
* Google Chrome extension
* express generator starter project (CLI?)

