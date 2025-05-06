// This is the entry point for the bot and the web server
// It runs both the Express server and the Telegram bot (web API + bot logic)
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const connectDB = require('../bot/database');
const User = require('../bot/User'); // Import User model from bot/User.js
const videoRoutes = require('./videoroutes');
const { bot, botRouter, setWebHook, token } = require('../bot');  // <-- bot runs here
const sessionConfig = require('../bot/session'); // Import session configuration
const { getUser, createUser, updateUserAmount } = require('../bot/database'); // Import from bot/database.js


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Connect to MongoDB
connectDB(); 

// === Middleware ===
// Session management
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Middleware for URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
    secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
    httpOnly: true,
    sameSite: 'lax' // Helps protect against CSRF attacks
   } // 14 days
}));



// === API Routes ===
app.use('/api/videos', videoRoutes);
app.use(botRouter); // <-- Bot routes for handling Telegram bot commands and messages


// === Serve Mini Web App ===
app.use(express.static(path.join(__dirname, '../mini-web-app')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../mini-web-app/home/home.html'));
});

// === WebSocket Logic ===
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (message) => {
    console.log('Received message from client:', message);

    // You can broadcast or process messages here if needed
    // Echo back to all clients:
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});


// === API Endpoints ===
app.get('/bot', (req, res) => {
  res.send('Telegram bot is running!');
});

app.get('/api', (req, res) => {
  res.send('API is running!');
});


// === Login with Telegram ID (check balance) / Balance API ===
app.post('/login-with-telegram', async (req, res) => {
  const { telegramId } = req.body; // Get Telegram ID from request body

  // Fetch user from the database
  const user = await User.findOne({ telegramId });
  if (!user) {
      return res.status(404).json({ error: 'User not found' });
  }

  // Respond with the user's balance
  res.status(200).json({ balance: user.balance });
}); 

app.post('/api/user-balance', async (req, res) => {
  const { telegramId } = req.body;
  if (!telegramId) {
      return res.status(400).json({ error: 'telegramId is required' });
  }

  try {
      const user = await getUser(telegramId);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ balance: user.walletBalance });
  } catch (error) {
      console.error('Error fetching balance:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


// === Fallback + error handlers ===
// 404 handler
app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});


// === Set Webhook automatically (only in production) ===
if (process.env.NODE_ENV === 'production') {
  const webhookUrl = `${process.env.BASE_URL}/bot${token}`;
  setWebHook(webhookUrl)
    .then(() => console.log(`Telegram webhook set to ${webhookUrl}`))
    .catch(err => console.error('Failed to set webhook:', err));
}

app.use(botRouter);



// === Start Web Server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
