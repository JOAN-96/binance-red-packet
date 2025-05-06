// This file is the main entry point for the bot logic and web server.
// It sets up the Express server, connects to MongoDB, and handles Telegram bot commands.
// It also serves a mini web app and handles WebSocket connections for real-time updates.
// === HEAD ===
require('dotenv').config();
console.log('Loaded env variables:', process.env);

// === END HEAD ===
// === Imports ===
// Importing required modules
const path = require('path');
const express = require('express');
const session = require('express-session'); 
const MongoStore = require('connect-mongo'); // MongoDB session store


const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI, // Mongo URI from your environment variable
  collection: 'sessions',
});

const mongoose = require('mongoose');
const http = require('http'); 
const WebSocket = require('ws'); 

const app = express(); 
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); 

// Import from bot folder
const { createUser, getUser, updateUserAmount } = require('./database');
const sessionConfig = require('./session');
const { bot, setWebHook, handleStartCommand, handleWebappCommand, logWalletUpdate } = require('./telegram')
const token = bot.token; // Access the token variable from the telegram module

const router = express.Router();


// === Middleware ===
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// === Connect to MongoDB ===
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Stop server if DB connection fails
  });

  
// === Middleware Session ===
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60, // 2 weeks
  }),
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
  name: 'sessionId',
  rolling: true,
  unset: 'destroy',
}));


mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  // Now you can safely use the database
}) .on('error', (error) => {
  console.error('MongoDB connection error:', error);
});


// Assuming you have already imported express, mongodb models etc.
app.get('/get-user-data', async (req, res) => {
    const userId = parseInt(req.query.userId, 10); // Get userId from query string
  
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
  
    try {
      // Search for the user document by Telegram user ID
      const user = await getUser(userId);
      const newUser = await createUser(userId, 'user'); // fallback username
  
      if (!user) {
        // If no user found - optionally create a new user document
      await createUser(userId, 'user'); // fallback username
  
        return res.json({
          walletBalance: newUser.walletBalance,
          videoWatchStatus: { video1: false, video2: false, video3: false }
        });
      }
  
      // Return existing user data
      res.json({
        walletBalance: user.walletBalance,
        videoWatchStatus: user.videoWatchStatus
      });
  
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
}); 

// === Serve static files from the 'mini-web-app' directory ===
app.use(express.static(path.join(__dirname, '../mini-web-app')));

// Route for mini web app
app.get('/', (req, res) => {
  // The index.html file will be served automatically by express.static
  res.sendFile(path.join(__dirname, '../mini-web-app/home/home.html'));
});


// === Telegram webhook endpoint ===
const telegramWebhookPath = `/bot${process.env.TELEGRAM_TOKEN}`;
app.post(telegramWebhookPath, async (req, res) => {
  console.log('Received webhook update:', req.body);

  const { message } = req.body;

  // Log the incoming message
  if (!message) {
    console.warn("No 'message' field in the webhook update:", req.body);
    return res.sendStatus(200); // Exit early if there's no message
  } 
  /* if (!message) return res.sendStatus(200); // Exit early if there's no message */

  const { chat, text } = message;

  try {
    if (text === '/start') {
      await handleStartCommand(message); // Direct /start handle call
    } else if (text === '/webapp') {
      await handleWebappCommand(chat.id, chat.username); // Direct /webapp handle call
    } else {
      await bot.sendMessage(chat.id, 'Unknown command');
    }
  } catch (error) {
    console.error('Error handling command:', error);
    await bot.sendMessage(chat.id, 'Sorry, something went wrong.');
  }

  res.sendStatus(200); // Always respond with 200 OK to Telegram
});


// === Wallet update endpoint ===
app.use(router);

router.post('/wallet-update', async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ error: 'Missing userId or amount' });
  }

  try {
    // Use the `updateUserAmount` function from database.js to update the user's wallet balance
    await updateUserAmount(userId, amount);

    // Retrieve the updated user from the database
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Broadcast the updated wallet amount to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) { // Check if the client is open
        client.send(JSON.stringify({ userId, amount: user.walletBalance }));
      }
    });

    /* if (!user) return res.status(404).json({ error: 'User not found' }); */

    return res.json({ success: true, walletBalance: user.walletBalance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// === User data fetch endpoint ===
/*router.get('/get-user-data', async (req, res) => {
  const userId = parseInt(req.query.userId, 10);
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const user = await getUser(userId);
    if (!user) {
      const newUser = await createUser(userId, 'user');
      return res.json({
        walletBalance: newUser.walletBalance,
        videoWatchStatus: { video1: false, video2: false, video3: false }
      });
    }

    res.json({
      walletBalance: user.walletBalance,
      videoWatchStatus: user.videoWatchStatus
    });
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}); */

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

      const user = await getUser(userId);
      if (!user) {
        const newUser = await createUser(userId, 'user');
        return res.json({
          walletBalance: newUser.walletBalance,
          videoWatchStatus: { video1: false, video2: false, video3: false }
        });
      }

      // Broadcast the updated wallet amount to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // Check if the client is open
          client.send(JSON.stringify({ userId, amount: user.walletBalance }));
        }
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
    await bot.setWebHook(`${process.env.BASE_URL}/bot${process.env.TELEGRAM_TOKEN}`);
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

// == Environment variables check ==
if (!process.env.MONGODB_URI || !process.env.TELEGRAM_TOKEN) {
  console.error('Required environment variables are missing!');
  process.exit(1); // Stop the server if critical environment variables are missing
} 
/*
// == Export the bot for use in other modules (that is to start it from server.js)==
module.exports = {
  bot,
  botRouter: router,
}
*/
