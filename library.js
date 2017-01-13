'use strict';

var meta = module.parent.require('./meta');
var user = module.parent.require('./user');

var db   = module.parent.require('./database'); // NodeBB / src / database 참고.
var au   = module.parent.require('./controllers/authentication'); // NodeBB / src / controllers 참고.

var winston = require('winston');
var jwt = require('jsonwebtoken');

var plugin = {};

plugin.init = function (params, callback)	{
	var mw = params.middleware;
	console.log('init');
	// console.log(arguments)
	// console.log(params, callback);
	// winston.add(winston.transports.File, {
	// 	level: 'debug',
	// 	json: false,
	// 	filename: 'my.log'
	// });

	// winston.info('This is info');
	// winston.error('This is error');
	callback();
};

plugin.loggedin = function (params, callback)	{
	console.log('normal console');

	// winston.info('winston logged in');
};

plugin.addMiddleware = function (req, res, next)	{
	jwt.verify(req.query.t, 'secret', function (err, result)	{
		if (err)	{
			return console.log('JWT Verify error: ', err);
		}
		console.log('JWT Verify result: ', result);
		var user_info = result,
			user_exist = db.getObjectField(user_info.institute_short + ':uid', user_info.id.replace('test', 'test102'), function (err, d)	{
				if (err)	{
					return console.log('User exist error: ', err);
				}
				console.log('User exist: ', d);
				return d;
			});

		console.log('Resulting of user exist: ', user_exist);

		if (user_exist)	{
			console.log('Already exist user');
			au.doLogin(req, user_exist, next);
		} else {
			var test = user_info.id.replace('test', 'test102');

			user.create({
			username: user_info.name,
			id: test,
			email: test,
			institude_short: user_info.institute_short
			}, function (err, uid)	{
				if (err)	{
					return console.log('Create user error: ', err);
				}

				console.log('Success create uid: ', uid);

				db.setObjectField(user_info.institute_short + ':uid', test, uid);

				au.doLogin(req, uid, next);
			});
		}
	});
};

plugin.loggedOut = function (data, callback)	{
	// console.log(data);
	console.log('logged Out');
};

module.exports = plugin;