//Die verschieden Adressteile, die bei der Kommunikation mit der API benötigt werden
const baseAdress = "stundenplan.hamburg.de";
const relativeAdressUnauthenticated = "/WebUntis/jsonrpc.do?school=HH5888";
const relativeAdressAuthenticated1 = "/WebUntis/jsonrpc.do;jsessionid=";
const relativeAdressAuthenticated2 = "?school=HH5888";

//Die Variable, die die jetzige Sesion speichert
var ergebnis;

//Authentifiziert den Server mit einer neuen SessionID
var authenticate = function(request, type)
{
	if(ergebnis!=null)
	{
		logout(ergebnis.result.sessionId)
		console.log("Abgemeldet")
	}
	var http = require("https");

	var options = {
		"method": "POST",
		"hostname": baseAdress,
		"port": null,
		"path": relativeAdressUnauthenticated,
		"headers": {
			"cache-control": "no-cache"
		}
	};

	var req = http.request(options, function (res) {
		var chunks = [];

		res.on("data", function (chunk) {
			chunks.push(chunk);
		});

		var returnValue;

		res.on("end", function () {
			var body = Buffer.concat(chunks);
			ergebnis = JSON.parse(body.toString())
			console.log(ergebnis.result.sessionId)
			mergedRequests(ergebnis.result.sessionId, type, request);
		});
	});

	req.write("{\n    \"id\": \"ID\",\n    \"method\": \"authenticate\",\n    \"params\": {\n        \"user\": \"HWG\",\n        \"password\": \"WMS4\",\n        \"client\": \"Client\"\n        },\n    \"jsonrpc\": \"2.0\"\n}");
	req.end();
}

//Ruft mit sessionID an der WebUntis API die Operation type auf und gibt das Ergebnis an request zurück.
var mergedRequests = function(sessionID, type, request)
{
	var http = require("https");

	var options = {
		"method": "POST",
		"hostname": baseAdress,
		"port": null,
		"path": relativeAdressAuthenticated1 + sessionID + relativeAdressAuthenticated2,
		"headers": {
			"cache-control": "no-cache",
			"JSESSIONID": sessionID
		}
	};

	var req = http.request(options, function (res) {
		var chunks = [];

		res.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res.on("end", function () {
			var body = Buffer.concat(chunks);
			console.log(type+"; Length: " + body.toString().length)
			request.end(body.toString())
		});
	});

	req.write("{\"id\":\"ID\",\"method\":\""+type+"\",\"jsonrpc\":\"2.0\"}");
	req.end();
}


//Meldet den Server ab.
var logout = function(sessionId)
{
	var http = require("https");

	var options = {
		"method": "POST",
		"hostname": baseAdress,
		"port": null,
		"path": relativeAdressAuthenticated1 + sessionId + relativeAdressAuthenticated2,
		"headers": {
			"cache-control": "no-cache",
			"JSESSIONID": sessionId
		}
	};

	var req = http.request(options, function (res) {});

	req.write("{\"id\":\"ID\",\"method\":\"logout\",\"params\":{},\"jsonrpc\":\"2.0\"}");
	req.end();
}

exports.logout = logout;
exports.mergedRequests = mergedRequests;
exports.authenticate = authenticate;