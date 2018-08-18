module.exports = function (app) {
    var config = require('../config');
    var logger = require('../utils/logger');
    var session = require('express-session');
    var CouchbaseStore = require('connect-couchbase')(session);

    var dbConfig = {
        host: config.get('couchbase.host'),
        bucket: config.get('couchbase.buckets.session')
    };

    var couchbaseStore = new CouchbaseStore(dbConfig);
    couchbaseStore.on('connect', function () {
        logger.debug("Couchbase Session store is ready for use");
    });

    couchbaseStore.on('disconnect', function () {
        logger.debug("An error occurred connecting to Couchbase Session Storage");
    });

    app.use(session({
        name: config.get('server.session.sidname'),
        cookie: {
            path: config.get('server.session.path'),
            httpOnly: config.get('server.session.httpOnly'),
            secure: config.get('server.session.secure'),
            maxAge: config.get('server.session.maxAge')
        },
        secret: config.get('server.session.cookieSecret'),
        store: couchbaseStore,
        saveUninitialized: true,
        resave: true,
        proxy: config.get('server.session.proxy'),
        rolling: config.get('server.session.rolling')
    }));
};