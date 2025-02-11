const TelegramBot = require('node-telegram-bot-api');
const axios =require('axios');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

//Token gotten from BotFather
/* const token = process.env.Telegram_Token; */
const token = '8109321488:AAH5bd7bxVTSz6__HugRn0F02BlODujC9Pc'; 

const bot = new TelegramBot(token, { polling: true });


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


// Keyboards
const keyboards = {
    mainKeyboard: [
        [
            {
                text: 'Channels',
                callback_data: 'channels'
            },
        ],
        [
            {
                text: 'Start',
                callback_data: 'start'
            },
        ],
        [
            {
                text: 'Open web',
                web_app: {
                    url: `http://localhost:${port}/mini-web-app`
                },
            },
        ],
    ],
    youtubeKeyboard: [
        [
            {
                text: 'Queen Tech',
                url: 'https://www.youtube.com/watch?v=hmSSQv4AyGU'
            },
            {
                text: 'Crypto Levy',
                url: 'https://www.youtube.com/@cryptolevy?si=QXQimY13s4CSMaPu'
            },
            {
                text: 'Mega Cash',
                url: 'https://www.youtube.com/@cashmega?si=I7MIP1Hcpou3nAeY'
            }
        ]
    ]
};


// Utils
const utils = {
    sendWelcomeMessage: async (chatID) => {
        try {
            const telegramChannels = requiredChannels.map((channel) => [
                { text: channel.name, url: channel.link },
            ]);

            const youtubeButton = [
                [
                    {
                        text: 'Subscribe to our YouTube channels',
                        callback_data: 'youtube_channels'
                    },
                ],
            ];

            const mainKeyboard = keyboards.mainKeyboard;
            const combinedKeyboard = [...telegramChannels, youtubeButton, mainKeyboard];

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
                    text: channel.name,
                    url: channel.link
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
    }
};


// Handlers
const handlers = {
    messageHandler: async (msg) => {
        console.log('Message handler called:', msg);
        try {
            const chatID = msg.chat.id;
            const text = msg.text;

            if (text === '/start') {
                await utils.sendWelcomeMessage(chatID);
            }
        } catch (error) {
            console.error(error);
        }
    },

    callbackQueryHandler: async (query) => {
        console.log('Callback query handler called:', query);
        try {
            const chatID = query.message.chat.id;
            const data = query.data;
    
            switch (data) {
                case 'start':
                    await bot.sendMessage(chatID, 'Welcome!');
                    break;
    
                case 'channels':
                    await utils.showChannels(chatID);
                    break;
    
                case 'youtube_channels':
                    const youtubeChannels = [
                        [
                            {
                                text: 'Queen Tech',
                                url: 'https://www.youtube.com/watch?v=hmSSQv4AyGU'
                            },
                        ],
                        [
                            {
                                text: 'Crypto Levy',
                                url: 'https://www.youtube.com/@cryptolevy?si=QXQimY13s4CSMaPu'
                            },
                        ],
                        [
                            {
                                text: 'Mega Cash',
                                url: 'https://www.youtube.com/@cashmega?si=I7MIP1Hcpou3nAeY'
                            },
                        ],
                    ];
    
                    await bot.sendMessage(chatID, 'Subscribe to our YouTube channels:', {
                        reply_markup: {
                            inline_keyboard: youtubeChannels
                        }
                    });
                    break;
    
                // Handle other callback queries
            }
        } catch (error) {
            console.error(error);
        }
    },
};


// Events Listener
bot.on('message', (msg) => {
    if (msg.text === '/start') {
        const chatID = msg.chat.id;
        utils.sendWelcomeMessage(chatID);
    } else {
        handlers.messageHandler(msg);
    }
});

bot.on('callback_query', (query) => {
    console.log('Received callback query:', query);
    handlers.callbackQueryHandler(query);
});

bot.on('error', (error) => {
    console.error(error);
}); 

// Server
miniWebApp.use(express.static('mini-web-app'));

miniWebApp.listen(port, () => {
    console.log(`Mini web app listening on port ${port}`);
});

/*
// New route for mini web app
miniWebApp.use('/mini-web-app', express.static('../mini-web-app'));




/* // Testing the bot
const TelegramBot = require('node-telegram-bot-api');
const token = '8109321488:AAH5bd7bxVTSz6__HugRn0F02BlODujC9Pc';

const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
    if (msg.text === '/start') {
        bot.sendMessage(msg.chat.id, 'Welcome!');
    }
});

bot.on('error', (error) => {
    console.error(error);
});
*/