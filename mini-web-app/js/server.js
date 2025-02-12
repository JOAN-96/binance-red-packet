// Server (server.js) for the mini-web-app
const express = require('express');
const app = express();
const path = require('path');
const verifyTelegramAuth = require('./auth'); // Import the verifyTelegramAuth function

// Authentication middleware
const authenticate = (req, res, next) => {
  const telegramAuth = req.query['telegram-auth'];
  if (verifyTelegramAuth(telegramAuth)) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

// Use authentication middleware for all routes
app.use(authenticate);

// Serve static files
app.use(express.static(path.join(__dirname, '../mini-web-app')));
/*
app.get('/', (req, res) => {
  console.log('Request query:', req.query);
  const telegramAuth = req.query['telegram-auth'];
  if (verifyTelegramAuth(telegramAuth)) {
    console.log('Authentication successful');
    // Serve the index.html file
    res.sendFile(path.join(__dirname, '../index.html'));
  } else {
    console.log('Authentication failed');
    res.status(401).send('Unauthorized');
  }
}); 
*/
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server listening on port 3000');
});