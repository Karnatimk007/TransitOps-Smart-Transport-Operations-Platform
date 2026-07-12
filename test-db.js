const https = require('https');
https.get('https://transitops-smart-transport-operations-a12n.onrender.com/ping-db', res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('RESPONSE:', body));
});
