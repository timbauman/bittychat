var http = require('http');
var fs = require('fs');
var url = require('url');

var memjs = require('memjs');
var mc = memjs.Client.create();

var data = {};
var port = process.env.PORT || 8000;
console.log(port);
http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.writeHead(200, {'Content-Type': 'text/plain'});
  u = url.parse(req.url, true);
  if (u.query.k.length <= 300 && (!u.query.v || u.query.v.length <= 5000)) {
    if (u.query.v) {
        mc.set(u.query.k, u.query.v);
        console.log('Set ' + u.query.k + ' to ' + u.query.v);
        res.end('');
      } else {
        mc.get(u.query.k, function(error, v) {
          if (v) {
            console.log('Returned ' + v + ' for ' + u.query.k);
            res.end(v);
          } else {
            console.log('nothing ' + u.query.k);
            res.end('');
          }
        });
      }
  }
}).listen(port);

console.log('Server running at http://' + process.env.HOST + ':' + port + '/');
