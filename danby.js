#!/usr/bin/env node

var yargs = require('yargs')
.option('port', { describe: 'http port', demandOption:true})
.option('cfg', { describe: 'path to json config file'})
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
var wsProto = typeof(argv.cert)=='undefined' ? "ws": "wss";
var grpc = require('grpc');
var services = {};
var apiText="";

function getConfig(filename) {
	if (filename.startsWith('/'))
		return JSON.parse(fs.readFileSync(filename, 'utf8'));
	else
		return JSON.parse(fs.readFileSync(__dirname + "/" + filename, 'utf8'));
}
function getSvcRemote(svcName) {
	return "services['" + svcName + "'].remote." + svcName;
}
function getSvcConnect(svcName) {
	return "services['" + svcName + "'].grpc";
}

async function main() {
	if (typeof(argv.cfg)!=='undefined') {
		var cfgData = getConfig(argv.cfg);
		
		for (let item of cfgData) {
			if (item.service) {
				let root = await protobuf.load(item.proto);
				const apiData = api(root,item.service, wsProto);
				var generatedApi = apiData["output"];
				var methodNames = apiData["methods"];
				var proto = grpc.load(item.proto);
				var stub=null; 
				eval("stub = proto." + item.pkg);
				var service = { cfg:item, api:generatedApi,methods:methodNames,remote:stub, grpc:item.grpc};
				services[item.service] = service;
				apiText+=generatedApi;
			}
		}
	}

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

		  if (services[obj["service"]].methods.includes(obj["method"]) && typeof(obj["payload"]==='object')) {

			  var client;
			  if (typeof(obj["metadata"])!=='undefined') {

				Object.keys(obj["metadata"]).forEach((name,idx) => {
					metadata.set(name, obj["metadata"][name]);	
				});
			  }
			 
			  var cmd = "client = new " + getSvcRemote(obj["service"]) + "(" + getSvcConnect(obj["service"]) + ", grpc.credentials.createInsecure())";

			  if (typeof(argv.debug)!=='undefined' && argv.debug==='true') 
				  console.log("C:" + cmd);

			  eval(cmd);

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
}
main();
