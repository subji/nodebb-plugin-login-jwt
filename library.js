'use strict';

var meta = module.parent.require('./meta');
var user = module.parent.require('./user');

var winston = require('winston');

var plugin = {};

plugin.init = function (params, callback)	{
	winston.add(winston.transports.File, {
		level: 'debug',
		json: false,
		filename: 'my.log'
	});

	winston.info('This is info');
	winston.error('This is error');
}