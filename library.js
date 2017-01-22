'use strict';

var meta = module.parent.require('./meta');
var user = module.parent.require('./user');

var db = module.parent.require('./database'); // NodeBB / src / database 참고.
var au = module.parent.require('./controllers/authentication'); // NodeBB / src / controllers 참고.

var winston = require('winston');
var jwt = require('jsonwebtoken');
// 모듈 객체.
var plugin = {};

// 이 함수는 NodeBB 에서 어떤 동작 또는 페이지이동 때마다 호출되므로 계속해서 토큰을 받아오고 유저 유효성 검사를 할 것이다.
// 그러므로 함수 첫줄에 세션 확인을 하는 구문을 만들어 같은 세션일 경우 유저 유효성 검사를 넘어가도록 한다.
// 로그 처리를 윈스턴을 이용해서 다시 구성해야 할 것 같다.
plugin.addMiddleware = function (req, res, next)	{
	// 이미 있는 세션일 경우 요청 프로퍼티에 user 와 user 안에 uid 가 존재 한다.
	var hasSession = req.hasOwnProperty('user') && req.user.hasOwnProperty('uid') && parseInt(req.user.uid, 10) > 10;

	plugin.session = hasSession;

	if (plugin.session)	{
		console.log('is Session', plugin.session);
		// 기존 유저가 접속되어있는 경우 세션확인 후 유저 유효성 검사 없이 진행한다.
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
					console.log('Exist user');
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
					institute_short: user_info.institute_short
					}, function (err, uid)	{
						if (err)	{
							return console.log('Create user error: ', err);
						}
						// TODO.
						// 이메일이 중복되었을 경우, 에러가 발생하는데 이를 방지할 대책을 세워야 한다.
						console.log('Success create uid: ', uid);

						db.setObjectField(user_info.institute_short + ':uid', test, uid);

						au.doLogin(req, uid, next);
					});
				}
			});
		});
	}	
};

plugin.doLogout = function (data, callback)	{
	console.log('logout: ', data);

	callback();
}

module.exports = plugin;