#!/usr/bin/env node
var yargs = require('yargs')
.option('grpc', { describe: 'grpc-server:port', demandOption:true })
.option('service', { describe: 'service name', demandOption:true })
.option('pkg', { describe: 'package namespace', demandOption:true })
.option('port', { describe: 'http port', demandOption:true})
.option('proto', { describe: 'path to .proto file', demandOption:true})
.option('cert', { describe: 'path to cert file'})
.option('key', { describe: 'path to private key for ssl/tls'})
.option('webroot', { describe: 'path to webroot, defaults to $PWD'})
.option('debug', { describe: 'debug output to console'});

var argv = yargs.argv;
var express = require('express');
var https = require('https');
var fs = require('fs')
var protobuf = require('protobufjs');
var api = require('./template-parser');

var app = express();
var expressWs = require('express-ws')(app);
var apiText = "";
var methodNames;
var wsProto = typeof(argv.cert)=='undefined' ? "ws": "wss";

protobuf.load(argv.proto)
    .then(function(root) {
      const apiData = api(root,argv.service, wsProto);
      apiText = apiData["output"];
      methodNames = apiData["methods"];
    });


var grpc = require('grpc');
var proto = grpc.load(argv.proto);
var stub; 
eval("stub = proto." + argv.pkg);

app.use(require('helmet')());

if (typeof(argv.webroot)=='undefined')
	app.use('/', express.static("."));
else
	app.use('/', express.static(argv.webroot));

app.get('/grpc-api', function(req, res, next) {
   res.setHeader("Content-Type", "application/javascript");
   res.send(apiText);	
   res.end();
});

app.ws('/grpc-ws', function(ws, req) {
  ws.on('message', function(msg) {
 	  function respond(data) {
		var str = JSON.stringify(data);
		if (typeof(argv.debug)!=='undefined' && argv.debug==='true') 
			console.log("S:" + str);
		ws.send(str);
		ws.close();
          };
	  var obj = JSON.parse(msg);
	  var metadata = new grpc.Metadata();

	  if (methodNames.includes(obj["method"]) && typeof(obj["payload"]==='object')) {

		  var client;
		  if (typeof(obj["metadata"])!=='undefined') {

			Object.keys(obj["metadata"]).forEach((name,idx) => {
				metadata.set(name, obj["metadata"][name]);	
			});
		  }

		  eval("client = new stub." + argv.service + "('" + argv.grpc + "', grpc.credentials.createInsecure())");

		  var call = "client." + obj["method"] + "(" + JSON.stringify(obj["payload"]) + ", metadata , function (err,response) { respond(response); });";
		  if (typeof(argv.debug)!=='undefined' && argv.debug==='true') 
	  		console.log("C:" + call);
		  eval(call); 
	  }
  });

});
 
app.listen(argv.port);

if (typeof(argv.cert)!=='undefined' && typeof(argv.key)!=='undefined') {
	var options = {
		cert : fs.readFileSync(argv.cert),
		key : fs.readFileSync(argv.key)
	};
	https.createServer(options,app).listen(443);
}


