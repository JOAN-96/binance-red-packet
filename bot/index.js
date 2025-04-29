// HEAD
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const { User, getUser, createUser, updateUserAmount } = require('./database');
const sessionConfig = require('./session');
const { bot, setWebHook} = require('./telegram')
const token = bot.token // Access the token variable from the telegram module

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


// === Telegram webhook endpoint ===
app.post(`/bot${process.env.TELEGRAM_TOKEN}`, async (req, res) => {
  const message = req.body.message;
  if (message) {
    const { chat, text } = message;
    const userId = chat.id;
    const userUsername = chat.username;

    // Log the message
    console.log(`Received message from ${userUsername}: ${text}`);

    // Handle the user commands by delegating to telegram.js
    try {
      if (text === '/start') {
        const responseText = await bot.handleStartCommand(userId, userUsername); // Handle /start
        res.send({
          method: 'sendMessage',
          chat_id: userId,
          text: responseText
        });
      } else if (text === '/webapp') {
        const responseText = await bot.handleWebappCommand(userId); // Handle /webapp
        res.send({
          method: 'sendMessage',
          chat_id: userId,
          text: responseText
        });
      } else {
        res.send('Unknown command');
      }
    } catch (error) {
      console.error('Error handling command:', error);
      res.send('Sorry, something went wrong.');
    }
  } else {
    res.send('No message received');
  }
});


// 404 handler
app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

// Globlal error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});


// WebSocket event listener
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');

  ws.on('message', async (message) => {
    try {
      const userData = JSON.parse(message);

      if (!userData || !userData.userId || !userData.amount) {
        console.error('Invalid WebSocket message:', message);
        return;
      }

      const userId = userData.userId;
      const amount = userData.amount;

      // Validate userId and amount
      if (typeof userId !== 'number' || typeof amount !== 'number') {
        console.error('Invalid userId or amount:', userId, amount);
        return;
      }

      await updateUserAmount(userId, amount);

      // Broadcast the updated wallet amount to all connected clients
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({ userId, amount }));
      });
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
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


app.get('/set-webhook', async (req, res) => {
  try {
    await bot.setWebHook(`https://vast-caverns-06591-d6f9772903a1.herokuapp.com/bot${process.env.TELEGRAM_TOKEN}`);
    res.send('Webhook set successfully');
  } catch (error) {
    console.error('Error setting webhook:', error);
    res.status(500).send('Failed to set webhook');
  }
});



// Set webhook only in production
if (process.env.NODE_ENV === 'production') {
  setWebHook(`https://vast-caverns-06591-d6f9772903a1.herokuapp.com/bot${process.env.TELEGRAM_TOKEN}`);
}