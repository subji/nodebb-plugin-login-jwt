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
			user_exist = db.getObjectField(user_info.institute_short + ':uid', user_info.id.replace('test', 'test101'), function (data)	{
				console.log('User exist: ', data);
				return data;
			});

		if (user_exist)	{
			console.log('Already exist user');
		} else {
			var test = user_info.id.replace('test', 'test101');

			user.create({
			username: user_info.name,
			id: test,
			email: test,
			institude_short: user_info.institute_short
			}, function (err, uid)	{
				if (err)	{
					return console.log('Create user error: ', err);
				}

				db.setObjectField(user_info.institute_short + ':uid', test, uid);
			});
		}

		next();
	});

	// req.uid = 14;
	// au.doLogin(req, 14, next);
	// });

	// if (!isExist)	{
	// 	db.setObjectField(decoded.username, 'username', )
	// }
	
};

plugin.loggedOut = function (data, callback)	{
	// console.log(data);
	console.log('logged Out');
};

module.exports = plugin;