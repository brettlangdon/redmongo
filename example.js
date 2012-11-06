var redmongo = require('./lib');

var host = '127.0.0.1';
var port = 27017;

var server = new redmongo.Server(host, port);
var db = new redmongo.Db('test', server, {safe:true});
db.open(function(err, db){
	db.collection('test', function(err, col){
		col.findOne({test:true}, function(err, results){
			console.dir(results);
		    });
	    });
    });