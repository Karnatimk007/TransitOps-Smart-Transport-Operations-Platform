const http = require('http');

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(body || '{}'));
          } else {
            reject({ status: res.statusCode, body: JSON.parse(body || '{}') });
          }
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  try {
    console.log('1. Testing Login...');
    const loginRes = await request('POST', '/api/auth/login', { email: 'fleet@transitops.com', password: 'password123' });
    console.log('✅ Login successful! Token received.');
    const token = loginRes.token;

    console.log('2. Testing Get Vehicles...');
    const vRes = await request('GET', '/api/vehicles', null, token);
    console.log(`✅ Fetched ${vRes.length} vehicles.`);

    console.log('3. Testing Dashboard...');
    const dRes = await request('GET', '/api/reports/dashboard', null, token);
    console.log(`✅ Dashboard stats: ${dRes.activeVehicles} active, ${dRes.activeTrips} active trips`);
    
    console.log('All core backend flows verified successfully!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
