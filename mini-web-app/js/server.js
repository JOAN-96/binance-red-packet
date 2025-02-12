// Server (server.js) for the mini-web-app
const express = require('express');
const app = express();
const path = require('path');
const verifyTelegramAuth = require('./auth'); // Import the verifyTelegramAuth function

app.use(express.static(path.join(__dirname, '../mini-web-app')));

app.get('/', (req, res) => {
  const telegramAuth = req.query['telegram-auth'];
  if (verifyTelegramAuth(telegramAuth)) {
    // Serve the index.html file
    res.sendFile(path.join(__dirname, '../index.html'));
  } else {
    res.status(401).send('Unauthorized');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server listening on port 3000');
});