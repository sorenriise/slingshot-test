var http = require('http');
var fs = require('fs');
var cnt=40;
http.createServer(function (req, res) {
  console.log("REQ", req);
  var ws = fs.createWriteStream("/tmp/file"+cnt++);
  req.pipe(ws);
  //req.on('data',function(d){console.log(d.toString());})
  res.writeHead(200, {'Content-Type': 'text/plain','Access-Control-Allow-Origin':'*'});
  res.end('Hello World\n');
}).listen(8000, '127.0.0.1');
console.log('Server running at http://127.0.0.1:8000/');
