const WEB_APP_URL = 'https://cryptic-caverns-38004-f55e3bfbd857.herokuapp.com/';
const TelegramBot = require('node-telegram-bot-api');
const { getUser, createUser } = require('./database');
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
        await createUser(telegramId, telegramUsername);
    }

    // Telegram Channels
    const telegramChanelsText = 'Telegram Channels: \n';
    const telegramChanels = [
        '• Crypto Levy: https://t.me/Cryptolevychannel\n',
        '• Cash Megan: https://t.me/Cashmegan\n'
    ];

    // YouTube Channels
    const youtubeChanelsText = 'YouTube Channels: \n';
    const youtubeChanels = [
        '• Crypto Levy YouTube: https://www.youtube.com/@cryptolevy?si=QXQimY13s4CSMaPu\n',
        '• Cash Megan YouTube: https://www.youtube.com/@cashmega?si=I7MIP1Hcpou3nAeY\n'
    ];

    // Welcome Message
    const welcomeText = 'Join all the Telegram channels and subscribe to our YouTube channels to get the latest updates and get the best use of the bot!';

    // Telegram Channels Keyboard
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

    // YouTube Channels Keyboard
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

    // Send the welcome message with the combined keyboard
    await bot.sendMessage(chatID, welcomeText, {
        reply_markup: {
            inline_keyboard: combinedKeyboard
        }
    });
}

bot.onText(/\/start/, async (msg) => {
    try {
        console.log(`User ${msg.from.username} started the bot`);
        await handleStartCommand(msg);
    } catch (error) {
        console.error(`Error handling /start command: ${error}`);
        await bot.sendMessage(msg.chat.id, 'Sorry, an error occurred. Please try again later!');
    }
});

bot.on('message', async (msg) => {
    console.log(`Received message from ${msg.from.username}: ${msg.text}`);
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const telegramUsername = msg.from.username;

    try {
        // Authenticate user and store their Telegram username in the database
        const user = await getUser(telegramId);
        if (!user) {
            // Create a new user
            await createUser(telegramId, telegramUsername);
        }
    } catch (error) {
        console.error(`Error creating or getting user: ${error}`);
        await bot.sendMessage(chatId, 'Sorry, an error occurred. Please try again later!');
    }
});

bot.on('callback_query', async (query) => {
    try {
        console.log(`Received callback query from ${query.from.username}: ${query.data}`);
        const callbackData = query.data;

        if (callbackData === 'channel_cryptolevy') {
            await bot.answerCallbackQuery(query.id, { text: "Opening Crypto Levy channel..." });
            await bot.sendMessage(query.message.chat.id, "Join Crypto Levy: https://t.me/Cryptolevychannel");
        } else if (callbackData === 'channel_cashmegan') {
            await bot.answerCallbackQuery(query.id, { text: "Opening Cash Megan channel..." });
            await bot.sendMessage(query.message.chat.id, "Join Cash Megan: https://t.me/Cashmegan");
        } else if (callbackData === 'youtube_cryptolevy') {
            await bot.answerCallbackQuery(query.id, { text: "Opening Crypto Levy YouTube..." });
            await bot.sendMessage(query.message.chat.id, "Subscribe to Crypto Levy: https://www.youtube.com/@cryptolevy?si=QXQimY13s4CSMaPu");
        } else if (callbackData === 'youtube_cashmegan') {
            await bot.answerCallbackQuery(query.id, { text: "Opening Cash Megan YouTube..." });
            await bot.sendMessage(query.message.chat.id, "Subscribe to Cash Megan: https://www.youtube.com/@cashmega?si=I7MIP1Hcpou3nAeY");
        }
    } catch (error) {
        console.error(`Error handling callback query: ${error}`);
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
// Make token available for other modules
bot.token = token;