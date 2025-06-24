const axios = require('axios');
const requests = [
  { method: 'get', url: 'http://localhost:5000/api/v1/health' },
  { method: 'get', url: 'http://localhost:5000/api/v1/events' }
];

(async () => {
  for (const req of requests) {
    try {
      const res = await axios[req.method](req.url);
      console.log(`✅ ${req.method.toUpperCase()} ${req.url} - ${res.status}`);
    } catch (err) {
      console.log(`❌ ${req.method.toUpperCase()} ${req.url} - ${err.response?.status || err.code}`);
    }
  }
  process.exit();
})();