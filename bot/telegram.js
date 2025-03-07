const WEB_APP_URL = 'https://cryptic-caverns-38004-f55e3bfbd857.herokuapp.com/';
const TelegramBot = require('node-telegram-bot-api');
const axios =require('axios');
const { getUser, createUser } = require('./bot/database');
const { text } = require('express');
require('dotenv').config();

//Token gotten from BotFather
const token = process.env.Telegram_Token; 

const bot = new TelegramBot(token, { polling: true });

const debug = true;

// Bot commands
bot.setMyCommands([
   /*  {
        command: 'start',
        description: 'Start the bot'
    }, */
    {
        command: 'webapp',
        description: 'Launch',
        type: 'web_app',
        web_app: {
            url: 'https://cryptic-caverns-38004-f55e3bfbd857.herokuapp.com/'  // Replace with your Heroku app URL 
        } 
    }
]);

// Events Listener
async function handleStartCommand(msg) {
    const chatID = msg.chat.id;
    const telegramUsername = msg.from.username;
    const telegramId = msg.from.id;

    // Authenticate users and store their  Telegram username in the database
    const user = await getUser(telegramId);
    if (!user) {
        // Create a new user
        await createUser(telegrmaId, telegramUsername);
    }

    // Telegram Channels
    const telegramChannelsText = 'Telegram Channels List:';
    const telegramChannelsKeyboard = [
        [
            {
                text: 'Crypto Levy',
                callback_data: 'channel_cryptolevy'
            },
            {
                text: 'Cash Megan',
                callback_data: 'channel_cashmegan'
            }
        ]
    ];

    // YouTube Channels
    const youtubeChannelsText = 'YouTube Channels List:';
    const youtubeChannelsKeyboard = [
        [
            {
                text: 'Crypto Levy YouTube',
                callback_data: 'youtube_cryptolevy'
            },
            {
                text: 'Cash Megan YouTube',
                callback_data: 'youtube_cashmegan'
            }
        ]
    ];

    const combinedKeyboard = [
        ...telegramChannelsKeyboard,
        ...youtubeChannelsKeyboard
    ];

    // Send a welcome message to the user
    const welcomeText = 'Join all the Telegram channels and subscribe to our YouTube channels to get the latest updates and get the best use of the bot!';

    await bot.sendMessage(chatID, welcomeText, {
        reply_markup: {
            inline_keyboard: combinedKeyboard
        }
    });
}

bot.onText(/\/start/, async (msg) => {
  try {
    await handleStartCommand(msg);
  } catch (error) {
    console.error(`Error handling /start command: ${error}`);
    await bot.sendMessage(msg.chat.id, 'Sorry, an error occurred. Please try again later!');
  }
});

bot.on('message', async (msg) => {
    console.log(`Received message from ${msg.from.username}: ${msg.text}`);
    const chatId = msg.chat.id;
    const telegramUsername = msg.from.username;

    // Authenticate user and store their Telegram username in the database
    const user = await getUser(telegramUsername);
    if (!user) {
        // Create a new user
        await createUser(telegramUsername);
    }
});

bot.on('callback_query', (query) => {
    console.log(`Received callback query from ${query.from.username}: ${query.data}`);
    const callbackData = query.data;

    if (callbackData === 'channel_cryptolevy') {
        bot.answerCallbackQuery(query.id, { url: 'https://t.me/Cryptolevychannel' });
    } else if (callbackData === 'channel_cashmegan') {
        bot.answerCallbackQuery(query.id, { url: 'https://t.me/Cashmegan' });
    } else if (callbackData === 'youtube_cryptolevy') {
        bot.answerCallbackQuery(query.id, { url: 'https://www.youtube.com/@cryptolevy?si=QXQimY13s4CSMaPu' });
    } else if (callbackData === 'youtube_cashmegan') {
        bot.answerCallbackQuery(query.id, { url: 'https://www.youtube.com/@cashmega?si=I7MIP1Hcpou3nAeY' });
    }
});

bot.on('error', (error) => {
    console.error('Telegram Bot Error:', error);
  });

// Telegram Web App 
bot.onText(/\/webapp/, (msg) => {
    const chatID = msg.chat.id;
    bot.sendMessage(chatID, 'Open Web App', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Open Web App',
                        web_app: {
                            url: WEB_APP_URL
                        }
                    }
                ]
            ]
        }
    });
});

module.exports = bot;