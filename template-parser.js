const Mustache = require("mustache");
const fs = require("fs");

function api(root, svc) {
	var output = "var " + svc + " = {}; \n";
	const template = fs.readFileSync(__dirname + '/template.txt', 'utf8');
	const svcdata = root.lookup(svc);
	const methods = svcdata["methods"];
	const methodNames = Object.keys(methods);

	methodNames.forEach( (name,idx) => {

		const method = methods[name];
		const requestType = method["requestType"];
		const responseType = method["responseType"];

		var view = {
			method: name,
			service: svc
		};

		output += Mustache.render(template, view);
	});
	return { 'output': output, 'methods': methodNames };
}
module.exports = api;
