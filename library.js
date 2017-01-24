'use strict';

var meta = module.parent.require('./meta');
var user = module.parent.require('./user');

var db = module.parent.require('./database'); // NodeBB / src / database 참고.
var au = module.parent.require('./controllers/authentication'); // NodeBB / src / controllers 참고.

var winston = require('winston');
var jwt = require('jsonwebtoken');
// 모듈 객체.
var plugin = {};

plugin.init = function (params, callback)	{
	winston.info('Start community..');

	callback();
}

plugin.verifyUser = function (token, callback)	{
	jwt.verify(token, 'secret', function (err, user_info)	{
		if (err)	{
			winston.error(err);

			return false;
		}

		winston.info('User information is ' + user_info);
		// MongoDB (nodebb) 에서 유저가 존재하는 지 확인한다. 기존에 test 란 유저는 존재했기에 test102로 잠깐 바꿔서 테스트한다.
		var user_exist = db.getObjectField(user_info.institute_short + ':uid', user_info.id.replace('test', 'test102'), function (err, isExist)	{
			if (err)	{
				winston.error('During checking user error : ', err);

				return false;
			}
			
			if (isExist)	{
				winston.info('Exist user ' + isExist);
				// 존재할 경우 로그인을 실행한다.
				callback(isExist);
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
						winston.error('Creating user ' + test + ' error : ' + err);
						
						return false;
					}
					// TODO.
					// 이메일이 중복되었을 경우, 에러가 발생하는데 이를 방지할 대책을 세워야 한다.
					winston.info('Success create uid : ', uid);

					db.setObjectField(user_info.institute_short + ':uid', test, uid);

					callback(uid);
				});
			}
		});
	});
}

// 이 함수는 NodeBB 에서 어떤 동작 또는 페이지이동 때마다 호출되므로 계속해서 토큰을 받아오고 유저 유효성 검사를 할 것이다.
// 그러므로 함수 첫줄에 세션 확인을 하는 구문을 만들어 같은 세션일 경우 유저 유효성 검사를 넘어가도록 한다.
plugin.addMiddleware = function (req, res, next)	{
	// 이미 있는 세션일 경우 요청 프로퍼티에 user 와 user 안에 uid 가 존재 한다.
	// TODO.
	// 로그아웃 후 재로그인한뒤에, 창을 닫고 바이오클라우드에서 다시 커뮤니티로 접속하면 세션관련 리프레쉬가 발생한다.
	// 이 경우 세션이 변경됨을 확인하고 리프레쉬를 해줘야한다.
	var hasSession = req.hasOwnProperty('user') && req.user.hasOwnProperty('uid') && parseInt(req.user.uid, 10) > 10;

	if (hasSession)	{
		winston.info('Already have session');
		// 기존 유저가 접속되어있는 경우 세션확인 후 유저 유효성 검사 없이 진행한다.
		return next();
	} else {
		// 별도의 쿠키를 관리하지 않으므로, 로그아웃 처리를 위하여 세션이 해제 됨과 동시에 쿼리받는 데이터도 없어진다.
		// 그래서 로그아웃 후에 현재 함수 호출시 조건으로 쿼리데이터를 선정하였다.
		if (!req.query.t) {
			return next();
		} else {
			// TODO.
			// 현재는 정해진 포맷에 맞춰 유저정보를 받고 입력하지만, 
			// 추후에는 사용자가 포맷을 정의하고 해당 포맷에 맞게 입력받게 만들어야 한다.
			plugin.verifyUser(req.query.t, function (uid) {
				winston.info('User ' + uid + ' is verified');

				au.doLogin(req, uid, next);
			});		
		}
	}	
};
// 로그아웃 함수.
plugin.doLogout = function (data, callback)	{
	winston.info('Do logout..');

	console.log(data.res.clearCookie)
	console.log(data.res.cookie())

	if (typeof callback === 'function')	{
		callback();	
	} else {
		return true;
	}
}

module.exports = plugin;