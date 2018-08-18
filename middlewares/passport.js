module.exports = function (app) {
	var passport = require('passport');
	var localStrategy = require('passport-local').Strategy;
	var user = require('../models/user');

	// instialize passport middleware
	app.use(passport.initialize());
	app.use(passport.session());

	// define local strategy
	var strategy = new localStrategy({
		usernameField: 'email',
		passwordField: 'password',
		session: true
	}, function (email, password, next) {
		user.authenticate(email, password).then(function (user) {
			next(null, user)
		}, function (error) {
			next(error);
		});
	});

	// setup local strategy
	passport.use(strategy);

	passport.serializeUser(function (user, next) {
		next(null, user.UserAccessToken);
	});

	passport.deserializeUser(function (UserAccessToken, next) {
		// user.findOne(UserAccessToken).then(function(auser) {
		// auser = common.sanitize(auser, schemas.loginResponse);
		// next(null, auser);
		// }, function(error) {
		next(null, {});
		// });
	});
};