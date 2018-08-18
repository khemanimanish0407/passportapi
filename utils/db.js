var util = require('util');
var config = require('../config');
var couchbase = require('couchbase');
var _ = require('lodash');
var cluster = new couchbase.Cluster(config.get('couchbase.host'));
cluster.authenticate('Administrator', '123456');
var q = require('q');
var uuid = require('node-uuid');
var db = require('./couchbase-db');
var logger = require('./logger');

/**
 * Add document to database
 * 
 * @param key
 *            document key
 * @param data
 *            document data
 */
var _addDocument = function(key, data, bucketName) {
	var deffered = q.defer();
	var add = q.denodeify(db.add);
	var promise = add(key, data, bucketName);
	promise.then(function(cas) {
		deffered.resolve(true)
	}, function(error) {
		logger.info(util.format('could not add document with key:%s, error:%j', key, error));
		deffered.reject(error);
	});
	return deffered.promise;
};
/**
 * Add Document To Database With Time To Leave
 * 
 * @param key
 *            document key
 * @param data
 *            document data
 * @param ttl
 *            document time to leave
 */
var _addDocumentWithTtl = function(key, data, ttl, bucketName) {
	var deffered = q.defer();
	var add = q.denodeify(db.add);
	var promise = add(key, data, {
		expiry : ttl
	}, bucketName);
	promise.then(function(cas) {
		deffered.resolve(true)
	}, function(error) {
		logger.info(util.format('could not add document with ttl with key:%s, error:%j', key, error));
		deffered.reject(error);
	});
	return deffered.promise;
};

/**
 * Get single document for given key
 * 
 * @param key
 *            document key to search for
 * @param withCas
 *            Boolean flag to get document with cas
 * @param bucketName
 *            bucket name
 */
var _getDocument = function(key, withCas, bucketName) {
	var deffered = q.defer();
	var get = q.denodeify(db.get);
	var promise = get(key, bucketName);

	promise.then(function(doc) {
		// Condition to check weather to give doc with cas value or not
		if (_.isUndefined(withCas) || !withCas) {
			deffered.resolve(db.parse(doc));
		} else {
			var document = {};
			document.cas = doc.cas;
			document.value = db.parse(doc);
			deffered.resolve(document);
		}
	}, function(error) {
		logger.info(util.format('could not find document with key:%s, error:%j', key, error));
		deffered.reject(error);
	});
	return deffered.promise;
};

/**
 * Returns documents array for provided keys
 * 
 * @param keys
 *            array of document keys to search for
 * @param withCas
 *            Boolean flag to get document with cas
 */
var _getDocuments = function(keys, withCas, bucketName) {
	var deffered = q.defer();
	db.getMulti(keys, bucketName, function(error, results) {
		var docs = {};
		var error = {};
		for ( var key in results) {
			// Condition to check weather document found or not
			if (!_.isUndefined(results[key].value)) {
				// Condition to check weather to give doc with cas value or not
				if (_.isUndefined(withCas) || !withCas) {
					docs[key] = db.parse(results[key]);
				} else {
					docs[key] = results[key];
				}
			} else {
				error[key] = results[key];
			}
		}
		deffered.resolve({
			docs : docs,
			errors : error
		});
	});
	return deffered.promise;
};

/**
 * Replace existing document
 * 
 * @param key
 *            document key to replace
 * @param doc
 *            document data
 * @param cas
 *            cas value to compare
 */
var _replaceDocument = function(key, doc, cas, bucketName) {
	var deffered = q.defer();

	var replace = q.denodeify(db.replace);
	var promise = null;
	if (_.isUndefined(cas) || !cas) {
		promise = replace(key, doc, bucketName);
	} else {
		// Compares cas value to check weather document is updated or not
		promise = replace(key, doc, {
			cas : cas
		}, bucketName);
	}
	promise.then(function(result) {
		deffered.resolve(result);
	}, function(error) {
		logger.info(util.format('could not replace document with key:%s, error:%j', key, error));
		deffered.reject(error);
	});
	return deffered.promise;
};

/**
 * Generates new UUID each time
 */
var _getNextKey = function() {
	return uuid.v4();
};

var _removeDocument = function(key, bucketName) {
	var deffered = q.defer();
	var remove = q.denodeify(db.remove);
	var promise = remove(key, bucketName);
	promise.then(function(result) {
		deffered.resolve(result);
	}, function(error) {
		logger.info(util.format('could not delete document with key:%s, error:%j', key, error));
		deffered.reject(error);
	});
	return deffered.promise;
};

/**
 * Returns document array of all available privileges
 * 
 * @param designDoc
 *            name of the Design Document
 * @param viewName
 *            name of the View
 * @param queryKey
 *            Key to be fired with query
 */
var _getDocumentsFromView = function(designDoc, viewName, queryKey, bucketName) {
	var deffered = q.defer();
	var query = q.denodeify(db.query);
	var queryView;
	if (_.isUndefined(queryKey)) {
		queryView = couchbase.ViewQuery.from(designDoc, viewName);
	} else {
		queryView = couchbase.ViewQuery.from(designDoc, viewName).key(queryKey);
	}

	var promise = query(queryView, bucketName);
	promise.then(function(result) {
		var docs = [];
		for (index in result) {
			docs.push(result[index]);
		}
		deffered.resolve(docs);
	}, function(error) {
		logger.info(util.format('error occured!, error:%j', error));
		deffered.reject(error);
	});
	return deffered.promise;
}

/**
 * To create an E-File
 * 
 * @param query
 *            N1ql query
 */
var _getN1qlDocuments = function(query, bucketName) {
	var deffered = q.defer();
	var queryFromDb = q.denodeify(db.query);

	var N1qlQuery = require('couchbase').N1qlQuery;
	query = N1qlQuery.fromString(query);

	var promise = queryFromDb(query, bucketName);
	promise.then(function(result) {
		deffered.resolve(result);
	}, function(error) {
		logger.info(util.format('error occured!, error:%j', error));
		deffered.reject(error);
	});
	return deffered.promise;
};

var _getNextCounterKey = function(bucketName, key, initialCounter) {
	var deffered = q.defer();
	var counter = q.denodeify(db.counter);

	if (initialCounter === undefined) {
		initialCounter = 1;
	}
	var promise = counter(key, 1, {
		initial : initialCounter
	}, bucketName);
	promise.then(function(result) {
		deffered.resolve(result);
	}, function(error) {
		logger.info(util.format('error getting next user counter key:%j', error));
		deffered.reject(error);
	});
	return deffered.promise;
}

module.exports = {
	getDocument : _getDocument,
	getDocuments : _getDocuments,
	addDocument : _addDocument,
	getNextKey : _getNextKey,
	replaceDocument : _replaceDocument,
	removeDocument : _removeDocument,
	getDocumentsFromView : _getDocumentsFromView,
	addDocumentWithTtl : _addDocumentWithTtl,
	getN1qlDocuments : _getN1qlDocuments,
	getNextCounterKey : _getNextCounterKey
};