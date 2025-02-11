/* const TelegramBot = require('node-telegram-bot-api');
const axios =require('axios');
const express = require('express');
require('dotenv').config();

//Token gotten from BotFather
const token = process.env.Telegram_Token; */
/* const token = '8109321488:AAH5bd7bxVTSz6__HugRn0F02BlODujC9Pc'; */
/*
const bot = new TelegramBot(token, { polling: true });

const keyboards = require('./keyboards')(bot);
const utils = require('./utils')(bot, keyboards);
const handlers = require('./handlers')(bot, keyboards, utils);

 bot.on('message', (msg) => {
    console.log('Received message:', msg);
    handlers.messageHandler(msg);
});

bot.on('callback_query', (query) => {
    console.log('Received callback query:', query);
    handlers.callbackQueryHandler(query);
}); 

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public')); */

/*app.get('/', (req, res) => {
    res.send('Kindly join our Telegram channels and subscribe to our YouTube channels.');
});*/
/*
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
*/

const TelegramBot = require('node-telegram-bot-api');
const token = '8109321488:AAH5bd7bxVTSz6__HugRn0F02BlODujC9Pcbot';

const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
    if (msg.text === '/start') {
        bot.sendMessage(msg.chat.id, 'Welcome!');
    }
});

bot.on('error', (error) => {
    console.error(error);
});