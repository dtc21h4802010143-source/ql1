const http = require('http');

const data = JSON.stringify({ email: 'admin@hrms.local', password: 'admin123' });

const req = http.request('http://localhost:5050/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', (c) => body += c);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log('BODY', body);
  });
});

req.on('error', (e) => { console.error('ERR', e); process.exit(1); });
req.write(data);
req.end();
