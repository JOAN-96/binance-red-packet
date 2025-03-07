  const path = require('path');
  const express = require('express');
  const session = require('express-session');
  const app = express();
  const server = require('http').createServer(app);
  const WebSocket = require('ws');
  const wss = new WebSocket.Server({ server });
  const { User, getUser, createUser, updateUserAmount } = require('./database');
  const sessionConfig = require('./session');
  const bot = require('./telegram')
  const token = bot.token // Access the token variable from the telegram module
  require('dotenv').config();

  // Serve static files from the 'mini-web-app' directory
  const port = process.env.PORT || 3000; // Server Port
  server.listen(port, '0.0.0.0', () => {
    console.log(`Mini web app listening on port ${port}`);
  }).on('error', (error) => {
    console.error('Error starting server:', error);
  });

  // Set up session middleware
  app.use(session(sessionConfig));
  app.use(express.static(path.join(__dirname, '../mini-web-app')));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use((req, res, next) => {
      res.status(404).send('Not Found');
  });
  app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).send('Internal Server Error');
  });

  // WebSocket event listener
  wss.on('connection', (ws) => {
      ws.on('message', async (message) => {
          try {
            const userData = JSON.parse(message);

            if (!userData || !userData.userId || !userData.amount) {
              console.error('Invalid WebSocket message:', message);
              return;
            }

            const userId = userData.userId;
            const amount = userData.amount;

            await updateUserAmount(userId, amount);

            wss.clients.forEach((client) => {
              client.send(JSON.stringify({ userId, amount }));
            });
          } catch (error) {
            console.error('Error handling WebSocket message:', error);
          }
        });
    });

  wss.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

  // Route for mini web app
app.get('/', (req, res) => {
  // The index.html file will be served automatically by express.static
  res.sendFile(path.join(__dirname, '../mini-web-app/index.html'));
});

// Create a webhook endpoint for telegram
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Set webhook only in production
if (process.env.NODE_ENV === 'production') {
  bot.setWebHook(`https://binance-red-packet.replit.app/bot${token}`);
}