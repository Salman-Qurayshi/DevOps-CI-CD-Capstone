const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello from the DevOps-Lab Node.js App!');
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'running', message: 'API is healthy' });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

module.exports = app; // Export app for testing