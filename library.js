'use strict';

var meta = module.parent.require('./meta');
var user = module.parent.require('./user');

var winston = require('winston');

var plugin = {};

plugin.init = function (params, callback)	{
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
	console.log(req, res, next);
	console.log('check jwt');

	next();
};

plugin.loggedOut = function (data, callback)	{
	// console.log(data);
	console.log('logged Out');
};

module.exports = plugin;

// (function (module)	{
// 	'use strict';

// 	var meta = module.parent.require('./meta');
// 	var user = module.parent.require('./user');

// 	var winston = require('winston');

// 	var init = function (params, callback)	{
// 		winston.add(winston.transports.File, {
// 			level: 'debug',
// 			json: false,
// 			filename: 'my.log'
// 		});

// 		winston.info('This is info');
// 		winston.error('This is error');		
// 	}

// }(module));