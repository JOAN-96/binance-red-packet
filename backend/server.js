// This is the entry point for the backend server
// It runs both the Express server and the Telegram bot (web API + bot logic)
require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const connectDB = require('./db');
const videoRoutes = require('./routes/videoroutes');
const { bot, botRouter } = require('./bot');  // <-- bot runs here
const path = require('path');

const app = express();
app.use(express.json());

// Connect MongoDB
connectDB();

// API Routes
app.use('/api/videos', videoRoutes);

// Telegram Bot Webhoot Route
app.use(botRouter);

// Serve mini web app
app.use(express.static(path.join(__dirname, '../mini-web-app')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../mini-web-app/home/home.html'));
});

// === WebSocket event listener ===
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
  
    ws.on('message', (message) => {
      console.log('Received message from client:', message);
  
      // You can broadcast or process messages here if needed
      // For example, echo back to all clients:
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


// Set Webhook automatically (only in production)
if (process.env.NODE_ENV === 'production') {
    bot.setWebHook(`https://vast-caverns-06591-d6f9772903a1.herokuapp.com/bot${process.env.TELEGRAM_TOKEN}`);
}

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
  

// Start Web Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
