var https = require('https');

const HOST = "io.adafruit.com";
const USER_NAME = "<<UserName>>";
const API_KEY = "<<Your Adafruit AIO Key>>";
const SPEAKER_FEED = "/api/v2/" + USER_NAME + "/feeds/livingroom.speaker/data";
const TV_FEED = "/api/v2/" + USER_NAME + "/feeds/livingroom.tv/data";

var methods = {};

methods.postSpeakerData = function(endpointId, value) {
 var object = createHttpObject(endpointId, value);
 log('DEBUG', `Inside postSpeakerData: ${JSON.stringify(object)}`);
 var req = https.request(object, function(res) {
  log('INFO', `Status: ` + res.statusCode);
  res.setEncoding('utf8');
  res.on('data', function (body) {
    log('DEBUG', 'Body: ' + body);
  });
 });
 req.on('error', function(e) {
   log('ERROR', 'problem with request: ' + e.message);
 });
 // write data to request body
 var jsonObj = JSON.stringify({
   value: value
 });
 req.write(jsonObj);
 req.end();
}

methods.postTVData = function(endpointId, value) {
 log('DEBUG', `Inside postTVData:` + value);
 var object = createHttpObject(endpointId, value);
 log('DEBUG', `Inside postSpeakerData: ${JSON.stringify(object)}`);
 var req = https.request(object, function(res) {
  log('DEBUG', 'Headers: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (body) {
    log('DEBUG', 'Body: ' + body);
  });
});
 req.on('error', function(e) {
   log('ERROR', 'problem with request: ' + e.message);
 });
 // write data to request body
 var jsonObj = JSON.stringify({
   value: value
 });
 req.write(jsonObj);
 req.end();
}

function createHttpObject(endpointId, value){
 var jsonObj = JSON.stringify({
  value: value
 });
 var post_options = {
      host: HOST,
      port: 443,
      method : 'POST',
      path: endpointId === "Speaker-400605" ? SPEAKER_FEED : TV_FEED,
      method: 'POST',
      headers: {
          'Accept' : 'application/json',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(jsonObj),
          'X-AIO-Key': API_KEY
      }
  };
  return post_options;
}

function log(title, msg) {
 console.log(`[${title}] ${msg}`);
}

module.exports = methods;
