const http = require('http');
const PORT = 5001;
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ ok: true, path: req.url }));
});
server.listen(PORT, '0.0.0.0', () => console.log('test server listening', PORT));
setTimeout(()=>{}, 1000000);