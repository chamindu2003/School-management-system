const http = require('http');

http.get('http://localhost:5001/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('RESPONSE', data));
}).on('error', (e) => {
  console.error('ERR', e.message);
});