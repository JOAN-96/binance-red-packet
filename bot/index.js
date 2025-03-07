const path = require('path');
const express = require('express');
const session = require('express-session');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const { getUser, createUser, updateUserAmount } = require('./database');
const sessionConfig = require('./session');
const bot = require('./telegram')
const token = bot.token // Access the token variable from the telegram module
const axios = require('axios');
require('dotenv').config();


app.use(session(sessionConfig));


// Channels
const channelLinks = {
    CHANNEL_QUEEN_TECH: 'https://t.me/Queenteac',
    CHANNEL_CRYPTO_LEVY: 'https://t.me/Cryptolevychannel',
    CHANNEL_CASH_MEGAN: 'https://t.me/Cashmegan',
    CHANNEL_RED_PACKET: 'https://t.me/BinanceredpacketBott',
}

const requiredChannels = [
    {
        name: 'Queen Tech',
        link: channelLinks.CHANNEL_QUEEN_TECH
    },
    {
        name: 'Crypto Levy',
        link: channelLinks.CHANNEL_CRYPTO_LEVY
    },
    {
        name: 'Cash Megan',
        link: channelLinks.CHANNEL_CASH_MEGAN
    },
    {
        name: 'Red Packet',
        link: channelLinks.CHANNEL_RED_PACKET
    },
];


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

// Server
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, '../mini-web-app')));

app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
});

// Route for mini web app
/* app.get('/', (req, res) => {
    const startParam = req.query.start;
    if (startParam) {
      // Authenticate the user with Telegram's API
      axios.post(`https://api.telegram.org/bot${token}/getUpdates`, {
        start: startParam,
      })
        .then((response) => {
          const userId = response.data.result[0].message.from.id;
          // Store the user ID securely
          req.session.userId = userId;
          res.sendFile(__dirname + '/../mini-web-app/index.html');
        })
        .catch((error) => {
          console.error('Error authenticating with Telegram:', error);
          res.status(500).send('Internal Server Error');
        });
    } else {
      res.sendFile(__dirname + '/../mini-web-app/index.html');
    }
  }); */


app.get('/', (req, res) => {
  const startParam = req.query.start;
  if (startParam) {
    // Start the bot and handle authentication
    bot.start(startParam);
    res.sendFile(__dirname + '/../mini-web-app/index.html');
  } else {
    res.sendFile(__dirname + '/../mini-web-app/index.html');
  }
});


/* app.listen(port, () => {
    console.log(`Mini web app listening on port ${port}`);
}); */
server.listen(port, () => {
    console.log(`Mini web app listening on port ${port}`);
});