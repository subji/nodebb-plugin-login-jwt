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

// 이 함수는 NodeBB 에서 어떤 동작 또는 페이지이동 때마다 호출되므로 계속해서 토큰을 받아오고 유저 유효성 검사를 할 것이다.
// 그러므로 함수 첫줄에 세션 확인을 하는 구문을 만들어 같은 세션일 경우 유저 유효성 검사를 넘어가도록 한다.
plugin.addMiddleware = function (req, res, next)	{
	console.log(req.user);
	
	var hasSession = req.hasOwnProperty('user') && req.user.hasOwnProperty('uid') && parseInt(req.user.uid, 10) > 10;

	if (hasSession)	{
		return next();
	} else {
		jwt.verify(req.query.t, 'secret', function (err, user_info)	{
			if (err)	{
				return console.log('JWT Verify error: ', err);
			}

			console.log('JWT Verify result: ', user_info);
			// MongoDB (nodebb) 에서 유저가 존재하는 지 확인한다.
			var user_exist = db.getObjectField(user_info.institute_short + ':uid', user_info.id.replace('test', 'test102'), function (err, isExist)	{
				if (err)	{
					return console.log('User exist error: ', err);
				}
				
				if (isExist)	{
					console.log('Already exist user');
					// 존재할 경우 로그인을 실행한다.
					au.doLogin(req, isExist, next);
				} else {
					// 존재 하지 않을 경우 NodeBB 플러그인의 유저 생성을 사용하여, uid 를 만들고 이를 MongoDB 에 넣는다.
					// 그리고 로그인을 실행한다.
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
		});
	}	
};

plugin.loggedOut = function (data, callback)	{
	// console.log(data);
	console.log('logged Out');
};

module.exports = plugin;