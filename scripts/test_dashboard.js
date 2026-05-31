const http = require('http');

const loginData = JSON.stringify({ email: 'admin@hrms.local', password: 'admin123' });

const loginReq = http.request('http://localhost:5050/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
}, (res) => {
  let body = '';
  res.on('data', (c) => body += c);
  res.on('end', () => {
    const json = JSON.parse(body);
    const token = json.token;
    console.log('Got token, requesting dashboard...');

    const req2 = http.request('http://localhost:5050/api/dashboard/summary', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (r2) => {
      let b2 = '';
      r2.on('data', (c) => b2 += c);
      r2.on('end', () => { console.log('DASHBOARD', b2); });
    });
    req2.on('error', (e) => console.error('ERR2', e));
    req2.end();
  });
});

loginReq.on('error', (e) => { console.error('ERR', e); process.exit(1); });
loginReq.write(loginData);
loginReq.end();
