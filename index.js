// === HEAD ===
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Import from bot folder
const { User, getUser, createUser, updateUserAmount } = require('./bot/database');
const sessionConfig = require('./bot/session');
const { bot, setWebHook, logWalletUpdate, handleStartCommand, handleWebappCommand} = require('./bot/telegram')
const token = bot.token; // Access the token variable from the telegram module


// === Middleware Session ===
app.use(session(sessionConfig));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// === Serve static files from the 'mini-web-app' directory ===
app.use(express.static(path.join(__dirname, 'mini-web-app')));

// Route for mini web app
app.get('/', (req, res) => {
  // The index.html file will be served automatically by express.static
  res.sendFile(path.join(__dirname, 'mini-web-app/home/home.html'));
});


// === Telegram webhook endpoint ===
app.post(`/bot${process.env.TELEGRAM_TOKEN}`, async (req, res) => {
  console.log('Received webhook update:', req.body);

  const { message } = req.body;

  // Log the incoming message
  if (!message) {
    console.warn("No 'message' field in the webhook update:", req.body);
    return res.sendStatus(200); // Exit early if there's no message
  }

  const { chat, text } = message;

  try {
    if (text === '/start') {
      await handleStartCommand(message); // Direct /start handle call
    } else if (text === '/webapp') {
      await handleWebappCommand(chat.id); // Direct /webapp handle call
    } else {
      await bot.sendMessage(chat.id, 'Unknown command');
    }
  } catch (error) {
    console.error('Error handling command:', error);
    await bot.sendMessage(chat.id, 'Sorry, something went wrong.');
  }

  res.sendStatus(200); // Always respond with 200 OK to Telegram
});


// === WebSocket event listener ===
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

// === Fallback + error handlers ===
// 404 handler
app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

// Globlal error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});


// === Webhook setup route ===
// This route is for setting the webhook manually
// You can call this route to set the webhook when needed
app.get('/set-webhook', async (req, res) => {
  try {
    await bot.setWebHook(`https://vast-caverns-06591-d6f9772903a1.herokuapp.com/bot${process.env.TELEGRAM_TOKEN}`);
    res.send('Webhook set successfully');
  } catch (error) {
    console.error('Error setting webhook:', error);
    res.status(500).send('Failed to set webhook');
  }
});


// === Start server ===
// Serve static files from the 'mini-web-app' directory
const port = process.env.PORT || 3000; // Server Port
server.listen(port, '0.0.0.0', () => {
  console.log(`Mini web app listening on port ${port}`);
}).on('error', (error) => {
  console.error('Error starting server:', error);
});


// == Set webhook automatically in production ===
if (process.env.NODE_ENV === 'production') {
  setWebHook(`https://vast-caverns-06591-d6f9772903a1.herokuapp.com/bot${process.env.TELEGRAM_TOKEN}`);
}