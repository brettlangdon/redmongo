var mongodb = module.exports = require('mongodb');
var redis = require('redis');
var util = require('util');


var native_findOne = mongodb.Collection.prototype.findOne;
mongodb.Collection.prototype.findOne = function findOne(){
    var args = Array.prototype.slice.call(arguments, 0);
    var callback = args.pop();
    var self = this;

    var redisClient = this.db.serverConfig['_redisClient'];
    if(args.length && redisClient){
	if(args[0]['_id'] != undefined && args[0]['_id'] != null){
	    var db_name = this.db.databaseName;
	    var key = db_name + '.' + args[0]['_id'];
	    this._handle_findOne(key, args, callback);
	} else if(Object.keys(args[0]).length == 1){
	    var keys = Object.keys(args[0]);
	    var db_name = this.db.databaseName;
	    var key = db_name + '.' + keys[0] + '.' + args[0][keys[0]];
	    this._handle_findOne(key, args, callback);
	} else{
	    native_findOne.apply(this, arguments);
	}
    } else{
	native_findOne.apply(this, arguments);
    }
};

mongodb.Collection.prototype._handle_findOne = function _handle_findOne(key, args, callback){
    var redisClient = this.db.serverConfig['_redisClient'];
    redisClient.get(key, function(err, results){
	    if(err || !results){
		args.push(function(err, results){
			if(!err && results){
			    redisClient.set(key, JSON.stringify(results));
			}
			callback(err, results);
		    });
		native_findOne.apply(self, args);
	    } else{
		callback(null, JSON.parse(results));
	    }
	});
};

var native_server = mongodb.Server;
mongodb.Server = function Server(host, port, options){
    var options = (options)?options:{};
    var default_host = this._redisHost = '127.0.0.1';
    var default_port = this._redisPort = 6379;
    if(options['redis'] != undefined && options['redis'] != null){
	this._redisPort = options['redis']['port'] || default_port;
	this._redisHost = options['redis']['host'] || default_host;
	this._redisOptions = options['redis']['options'] || {};
    }
    this._redisClient = redis.createClient(this._redisPort,
					       this._redisHost,
					       this._redisOptions);
    native_server.call(this, host, port, options);
};
util.inherits(mongodb.Server, native_server);