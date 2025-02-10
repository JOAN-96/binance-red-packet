const TelegramBot = require('node-telegram-bot-api');
const axios =require('axios');
const express = require('express');
require('dotenv').config();

//Token gotten from BotFather
const token = process.env.Telegram_Token;

const bot = new TelegramBot(token, {polling:true});

const handlers = require('./handlers');;
bot.on('message', handlers.messageHandler);
bot.on('callback_query', handlers.callbackQueryHandler);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

/*app.get('/', (req, res) => {
    res.send('Kindly join our Telegram channels and subscribe to our YouTube channels.');
});*/

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// New route for mini web app
app.use('/mini-web-app', express.static('../mini-web-app'));

bot.on('error', (error) => {
    console.error(error);
    if (error.code === 'ECONNREST' || error.code === 'ETIMEDOUT') {
        console.log('Retrying connection...');
        bot.stopPolling();
        setTimeout(() => {
            bot.startPolling();
        }, 1000);
    }
});