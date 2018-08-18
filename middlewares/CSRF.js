var util = require('util');
var _ = require('lodash');
var csrf = require('csurf');
var constants = require('../utils/constants');
var logger = require('../utils/logger');

module.exports = function(app) {
	// Check header for csrf token
	app.use(function(req, res, next) {
		if (req.method.toLowerCase() === 'post' && _.isUndefined(req.header('x-xsrf-token'))) {
			logger.warn('request without token');
			res.status(403).send({
				code : 4006,
				messageKey : constants.messageKeys.code_4006,
				data : {}
			});
		} else {
			next();
		}
	});

	// Intialize CSRF middleware
	app.use(csrf());

	app.use(function(req, res, next) {
		logger.info(util.format('Request: URL:%s - SessionID:%s', req.url, req.sessionID));
		var token = req.csrfToken();
		// for web and mobile application
		res.header('XSRF-TOKEN', token);

		if (req.method.toLowerCase() === 'get' && req.isAuthenticated()) {
			if (!_.isUndefined(req.header('x-xsrf-token'))) {
				// Valid user
				next();
			} else if (req.isAuthenticated()) {
				req.logout();
				for ( var cookie in req.cookies) {
					res.clearCookie(cookie);
				}
				req.session.destroy();
				res.status(200).end();
			}
		} else {
			next();
		}
	});

	app.use(function(error, req, res, next) {
		if (error.code !== 'EBADCSRFTOKEN') {
			return next(error);
		}

		logger.warn('possible CSRF attack detected');

		res.status(403).send({
			code : 4005,
			messageKey : constants.messageKeys.code_4005,
			data : {}
		});
	});
};