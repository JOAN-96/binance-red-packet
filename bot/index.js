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



// Events Listener
bot.onText(/\/start/, (msg) => {
    const chatID = msg.chat.id;

    const welcomeText = 'Join all the Telegram channels and subscribe to our YouTube channels to get the latest updates and get the best use of the bot!';

    bot.sendMessage(chatID, welcomeText);

    // Telegram Channels
    const telegramChannelsText = 'Telegram Channels List:';
    const telegramChannels = [
        'Queen Tech: https://t.me/Queenteac',
        'Crypto Levy: https://t.me/Cryptolevychannel',
        'Cash Megan: https://t.me/Cashmegan',
        'Red Packet: https://t.me/BinanceredpacketBott'
    ];
    bot.sendMessage(chatID, `${telegramChannels.join('\n')}`);

    //YouTube channels
    const youtubeButtonText = 'Subscribe to our YouTube channels';
    bot.sendMessage(chatID, youtubeButtonText, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: youtubeButtonText,
                        callback_data: 'youtube_channels'
                    }
                ]
            ]
        }
    });
});


bot.on('callback_query', (query) => {
    if (query.data === 'youtube_channels') {
        utils.sendYouTubeChannelsList(query.message.chat.id);
    }
});

bot.on('error', (error) => {
    console.error(error);
}); 

// Server
app.use(express.static('../mini-web-app'));

// Route for mini web app
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../mini-web-app/index.html');
});

app.listen(port, () => {
    console.log(`Mini web app listening on port ${port}`);
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