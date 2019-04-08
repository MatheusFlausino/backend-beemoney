'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

// Passport configurators..
var loopbackPassport = require('loopback-component-passport');
var LoopBackContext = require('loopback-context');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

var config = {};
try {
    config = require('../providers.json');
} catch (err) {
    console.trace(err);
    process.exit(1); // fatal
}

app.start = function() {
    // start the web server
    return app.listen(function() {
        app.emit('started');
        var baseUrl = app.get('url').replace(/\/$/, '');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};


app.use(LoopBackContext.perRequest());

// The access token is only available after boot
app.use(loopback.token({
    model: app.models.AccessToken,
  }));
app.use(function setCurrentUser(req, res, next) {
    if (!req.accessToken) {
        return next();
    }
    app.models.Usuario.findById(req.accessToken.userId, function(err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error('No user with this access token was found.'));
        }
        var loopbackContext = LoopBackContext.getCurrentContext();
        if (loopbackContext) {
            loopbackContext.set('currentUser', user);       
        }
        next();
    });
});

// Add Timestamp Mixin to loopback
require('loopback-ds-timestamp-mixin')(app);
// Add Kl-mixin-userIdentity to loopback
require('./mixins/kb-mixin-userIdentity')(app);
require('./mixins/kb-mixin-base')(app);
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module)
        app.start();
});

passportConfigurator.init();

passportConfigurator.setupModels({
    userModel: app.models.Usuario,
    userIdentityModel: app.models.userIdentity,
    userCredentialModel: app.models.userCredential,
});

for (var s in config) {
    var c = config[s];
    c.session = c.session !== false;
    passportConfigurator.configureProvider(s, c);
}