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
	// console.log(req);

	jwt.verify(req.query.t, 'secret', function (err, result)	{
		console.log(result);
		var user_info = result,
			user_exist = db.getObjectField(user_info.institute_short + ':uid', user_info.id, function ()	{
				console.log('user_exist: ', arguments);
			});

		console.log(db.getObjectField.apply(null, [user_info.institute_short + ':uid', user_info.id]))

		if (user_exist)	{
			console.log('Already exist user');
		} else {
			console.log('Not exist user');
		}

		// user.create({
			// username: user_info.name,
			// id: user_info.id,
			// email: user_info.id,
			// institude_short: user_info.institute_short
		// }, function (err, uid)	{
			// if (err)	{
			// 	console.error('Create user error: ', err);
				
			// 	return;
			// }

			// db.setObjectField(user_info.institute_short + ':uid', 'id', uid);
		// });

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