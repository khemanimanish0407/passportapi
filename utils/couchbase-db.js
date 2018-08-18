var couchbase = require("couchbase");
var config = require('../config');
var cluster = new couchbase.Cluster(config.get('couchbase.host'));
cluster.authenticate('Administrator', '123456');
var logger = require('./logger');
var util = require('util');
var _ = require('lodash');

// This makes one connection per require, it is not like global connection pool
var dbs = {};
var bucketKeys = _.keys(config.get('couchbase.buckets'));
for (var index in bucketKeys) {
	dbs[config.get('couchbase.buckets.' + bucketKeys[index])] = null;
}

// To-do when connection is no longer active or disconnected start new
// connection
var conn = function (bucketName, cb) {
	if (dbs[bucketName]) {
		return cb(null, dbs[bucketName]);
	}

	dbs[bucketName] = cluster.openBucket(bucketName, function (error) {
		if (error) {
			logger.error(util.format('error connecting with Couchbase: error %j', error));
			cb(error);
		} else {
			dbs[bucketName].operationTimeout = 60 * 1000;
			cb(null, dbs[bucketName]);
		}
	});

};

var commandWithConnection = function (cmd) {
	return function () {

		var args = [].slice.call(arguments, 0);
		var bucketName = args.slice(-2)[0];
		// Second last element of the arguments should always be bucket name
		args.splice(args.length - 2, 1);

		if (_.isUndefined(bucketName)) {
			bucketName = config.get('couchbase.defaultBucket');
		}

		// last element of the arguments is by convention
		var cb = args.slice(-1)[0];

		// the callback
		conn(bucketName, function (err, conn) {
			if (err) {
				return cb(err);
			}
			conn[cmd].apply(conn, args);
		});
	};
};

// parse document as JSON or object
var parse = function (doc) {
	if (typeof doc.value === "object") {
		return doc.value;
	} else {
		return JSON.parse(doc.value);
	}
};

// Add other function as needed
module.exports = {
	add: commandWithConnection("upsert"),
	set: commandWithConnection("set"),
	setDesignDoc: commandWithConnection("setDesignDoc"),
	remove: commandWithConnection("remove"),
	get: commandWithConnection("get"),
	shutdown: commandWithConnection("shutdown"),
	flush: commandWithConnection("flush"),
	replace: commandWithConnection("replace"),
	incr: commandWithConnection("incr"),
	decr: commandWithConnection("decr"),
	getMulti: commandWithConnection("getMulti"),
	query: commandWithConnection("query"),
	parse: parse,
	counter: commandWithConnection("counter"),
};