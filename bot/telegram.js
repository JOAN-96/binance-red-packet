const TelegramBot = require('node-telegram-bot-api');
const axios =require('axios');
const { getUser, createUser } = require('./database');
require('dotenv').config();

//Token gotten from BotFather
const token = process.env.Telegram_Token; 

const bot = new TelegramBot(token, { polling: true });

const debug = true;

// Utils
const utils = {
    sendWelcomeMessage: async (chatID) => {
        try {
            const telegramChannels = requiredChannels.map((channel) => [
                { text: channel.name /* url: channel.link */ },
            ]);

            const youtubeButton = [
                [
                    {
                        text: 'Subscribe to our YouTube channels',
                        callback_data: 'youtube_channels'
                    },
                ],
            ];

            const combinedKeyboard = [...telegramChannels, youtubeButton];

            await bot.sendMessage(chatID, 'Join our Telegram channels:', {
                reply_markup: { inline_keyboard: combinedKeyboard },
            });
        } catch (error) {
            console.error(`Error sending welcome message to chat ${chatID}: ${error}`);
        }
    },

    sendKeyboard: async (chatID, keyboard) => {
        try {
            await bot.sendMessage(chatID, 'Select an option:', {
                reply_markup: {
                    inline_keyboard: keyboard
                }
            });
        } catch (error) {
            console.error(`Error sending keyboard to chat ${chatID}: ${error}`);
        }
    },

    showChannels: async (chatID) => {
        try {
            const telegramChannels = requiredChannels.map((channel) => [
                {
                    text: channel.name
                    /* url: channel.link */
                }
            ]);

            await bot.sendMessage(chatID, 'Join the following Telegram channels:', {
                reply_markup: {
                    inline_keyboard: telegramChannels
                }
            });
        } catch (error) {
            console.error(`Error showing channels: ${error}`);
        }
    },

    checkMembership: async (chatID) => {
        try {
            for (const channel of requiredChannels) {
                const chat = await bot.getChatMember(channel.link.split('/').pop(), chatID);
                if (chat.status !== 'member' && chat.status !== 'administrator' && chat.status !== 'creator') {
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error(`Error checking membership: ${error.message}`);
            return false;
        }
    },

    sendYouTubeChannelsList: async (chatID) => {
        const youtubeChannelList = [
            'Queen Tech: https://www.youtube.com/watch?v=hmSSQv4AyGU',
            'Crypto Levy: https://www.youtube.com/@cryptolevy?si=QXQimY13s4CSMaPu',
            'Mega Cash: https://www.youtube.com/@cashmega?si=I7MIP1Hcpou3nAeY'
        ];

        await bot.sendMessage(chatID, `Here are our YouTube channels:\n\n${youtubeChannelList.join('\n')}`);
    }
};

// Set bot commands
bot.setMyCommands([
    {
        command: 'start',
        description: 'Start the bot'
    }, 
    {
        command: 'webapp',
        description: 'Open the web app',
        web_app: {
            url: 'https://cryptic-caverns-38004-f55e3bfbd857.herokuapp.com/'  // Replace with your Heroku app URL 
        } 
    }
]);

// Events Listener
bot.onText(/\/start/, async (msg) => {
    const chatID = msg.chat.id;
    const telegramUsername = msg.from.username;

    // Authenticate users and store their  Telegram username in the database
    const user = await getUser(telegramUsername);
    if (!user) {
        // Create a new user
        await createUser(telegramUsername);
    }

    // Telegram Channels
    const telegramChannelsText = 'Telegram Channels List:';
    const telegramChannelsKeyboard = [
        [
            {
                text: 'Queen Tech',
                callback_data: 'channel_queentech'
            },
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

    // Send a welcome message to the user
    const welcomeText = 'Join all the Telegram channels and subscribe to our YouTube channels to get the latest updates and get the best use of the bot!';

    await bot.sendMessage(chatID, welcomeText, {
        reply_markup: {
            inline_keyboard: telegramChannelsKeyboard
        }
    });

    // YouTube Channels Button
    const youtubeButton = [
        [
            {
                text: 'Subscribe to our YouTube channels',
                callback_data: 'youtube_channels'
            }
        ]
    ];

    await bot.sendMessage(chatID, 'Subscribe to our YouTube channels', {
        reply_markup: {
        inline_keyboard: youtubeButton
        }
    });
});

    
/*
    bot.sendMessage(chatID, `${telegramChannels.join('\n')}`);

        'Queen Tech: https://t.me/Queenteac',
        'Crypto Levy: https://t.me/Cryptolevychannel',
        'Cash Megan: https://t.me/Cashmegan',
        'Red Packet: https://t.me/BinanceredpacketBott'
*/

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

    if (callbackData === 'channel_queentech') {
        bot.answerCallbackQuery(query.id, { url: 'https://t.me/Queenteac' });
    } else if (callbackData === 'channel_cryptolevy') {
        bot.answerCallbackQuery(query.id, { url: 'https://t.me/Cryptolevychannel' });
    } else if (callbackData === 'channel_cashmegan') {
        bot.answerCallbackQuery(query.id, { url: 'https://t.me/Cashmegan' });
    } else if (callbackData === 'youtube_channels') {
        utils.sendYouTubeChannelsList(query.message.chat.id);
    }
});

bot.on('error', (error) => {
    console.error('Telegram Bot Error:', error);
  });

// Telegram Web App 
bot.onText(/\/webapp/, (msg) => {
    const chatID = msg.chat.id;
    const webAppURL = 'https://cryptic-caverns-38004-f55e3bfbd857.herokuapp.com/';
    bot.sendMessage(chatID, 'Open Web App', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Open Web App',
                        web_app: {
                            url: webAppURL
                        }
                    }
                ]
            ]
        }
    });
});

module.exports = bot;