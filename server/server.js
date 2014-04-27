var http = require('http');
var fs = require('fs');
var url = require('url');

var memjs = require('memjs');
var mc = memjs.Client.create();

var data = {};
var port = process.env.PORT || 8000;
console.log(port);
http.createServer(function (req, res) {
  // make sure local files can connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // http - the stupidest server ever; easily overrun with attacks
  var t = (new Date()).getTime();
  mc.get('i:' + req.connection.remoteAddress, function(error, v) {
      if (v && t - v < 500) {
        // don't let people connect more than once every 0.5 seconds
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('');
      } else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        var u = url.parse(req.url, true);
        // if it's a short key and value, let them do it
        if (u.query.k.length <= 300 && (!u.query.v || u.query.v.length <= 5000)) {
          // they gave a value; let them set it
          if (u.query.v) {
            mc.set(u.query.k, u.query.v);
            console.log('Set ' + u.query.k + ' to ' + u.query.v);
            res.end('');
          } else {
            mc.get(u.query.k, function(error, v) {
              if (v) {
                console.log('Returned ' + v + ' for ' + u.query.k);
                mc.delete(u.query.k);
                res.end(v);
              } else {
                console.log('nothing ' + u.query.k);
                res.end('');
              }
            });
          }
        }
      }
    });
  mc.set('i:' + req.connection.remoteAddress, t);
}).listen(port);

console.log('Server running at http://' + process.env.HOST + ':' + port + '/');
