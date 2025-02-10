const TelegramBot = require('node-telegram-bot-api');
const axios =require('axios');
const express = require('express');
require('dotenv').config();

//Token gotten from BotFather
const token = process.env.Telegram_Token;

const bot = new TelegramBot(token, {polling:true});

const CHANNEL_QUEEN_TECH = 'https://t.me/Queenteac';
const CHANNEL_CRYPTO_LEVY = 'https://t.me/Cryptolevychannel';
const CHANNEL_CASH_MEGAN = 'https://t.me/Cashmegan';
const CHANNEL_RED_PACKET = 'https://t.me/BinanceredpacketBott';

//Required Channels
const requiredChannels = [
    
    //Channel 1
    {
        name: 'Queen Tech',
        link: CHANNEL_QUEEN_TECH
    },
    
    //Channel 2
    {
        name: 'Crypto Levy',
        link: CHANNEL_CRYPTO_LEVY
    },

    //Channel 3
    {
        name: 'Cash Megan',
        link: CHANNEL_CASH_MEGAN
    },

    //Channel 4
    {
        name: 'Red Packet',
        link: CHANNEL_RED_PACKET
    }
];

//Bot Function List
// Main keyboard
const mainKeyboard = [
    [
        {
            text: 'Channels',
            callback_data: 'channels'
        }
    ],

    [
        {
            text: 'Start',
            callback_data: 'start'
        }
    ]
];

//YouTube Channel Keyboard
const youtubeKeyboard = [
     //YouTube Channels
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
];

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Kindly join our Telegram channels and subscribe to our YouTube channels.');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// New route for mini web app
app.use('/mini-web-app', express.static('/mini-web-app'));

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

// Function to send welcome message with keyboard
/**
 * Send a welcome message to the user with a keyboard.
 * 
 * @param {number} chatID - The ID of the chat to send the message to.
 */
function sendWelcomeMessage(chatID) {
    const welcomeText = 'To use our bot you must join all channels and subscribe to all the YouTube channels. Click the buttons below to join the channels and subscribe to the YouTube channels.';

    const telegramChannels = requiredChannels.map((channel) => [
        {
            text: channel.name,
            url: channel.link
        }
    ]);

    const youtubeButton = [
        [
            {
                text: 'Subscribe to our YouTube channels',
                callback_data: 'youtube_channels'
            }
        ]
    ];

    const combinedKeyboard = [...telegramChannels, ...youtubeButton];

    bot.sendMessage(chatID, welcomeText, {
        reply_markup: {
            inline_keyboard: combinedKeyboard
        }
    });
}

bot.on('message', (msg) => {
    try {
        console.log('Received message:', msg);
        const chatID = msg.chat.id;
        const text = msg.text;

        if (text === '/start') {
            try {
                bot.sendPhoto(chatID, 'https://imgur.com/kUTAtn1')
                .then((msg) => {
                    console.log(`Sent welcome photo: ${msg.message_id}`);
                    sendWelcomeMessage(chatID);
                    })
                    .catch((error) => {
                        console.error(`Error sending welcome photo: ${error}`);
                    });
                } catch (error) {
                    console.error(`Error sending welcome photo and message with keyboard: ${error}`);
                    }
                }

            // Check membership
            checkMembership(chatID, requiredChannels/*, requiredGroups*/)
            .then((isMember) => {
                console.log (`Is member: ${isMember}`);
                if (isMember) {
                    // User is a member of all required channels and groups, show keyboard
                    const webButton = [
                        [
                            {
                                text: 'Open web',
                                web_app: {
                                    url: 'https://cryptic-caverns-38004-f55e3bfbd857.herokuapp.com/'
                                }
                            }
                        ]
                    ];

                    const combinedKeyboard = [...mainKeyboard, [webButton]];

                    // Send the main keyboard and YouTube channels keyboard separately
                    bot.sendMessage(chatID, 'Select an option:', {
                        reply_markup: {
                            inline_keyboard: combinedKeyboard
                        }
                    });

                    bot.sendMessage(chatID, 'Subscribe to our YouTube channels:', {
                        reply_markup: {
                            inline_keyboard: youtubeKeyboard
                        }
                    });
            } else {
                // User is not a member of all required channels and groups, show join channels and groups buttons
                showChannels(chatID, requiredChannels);
            }
        })
        .catch((error) => {
            console.error(error);
        });
    } catch (error) {
        console.error(`Error handling message: ${error}`);
    }
});

bot.on('callback_query', (query) => {
    console.log('Received callback query:', query);
    const chatID = query.message.chat.id;
    const messageID = query.message.chat.id;
    const data = query.data;

    // Handle the callback data and provide the necessary reponse
    bot.editMessageText(`Received callback data: ${data}`, {
        chat_id: chatID,
        message_id: messageID,
    });

    switch (data) {
        case 'channels':
            showChannels(chatID, requiredChannels);
            checkMembership(chatID, requiredChannels)
            .then((isMember) => {
                if (!isMember) {
                    const webButton = [
                        {
                            text: 'Open Web',
                            web_app: {
                                url: 'https://cryptic-caverns-38004-f55e3bfbd857.herokuapp.com/'
                            }
                        } 
                    ];

                    const youtubeButton = [
                        {
                            text: 'Subscribe to our YouTube channels',
                            callback_data: 'youtube_channels'
                        }
                    ];

                    const combinedKeyboard = [...mainKeyboard, [webButton], [youtubeButton]];

                    bot.sendMessage(chatID, 'Select an option:', {
                        reply_markup: {
                            inline_keyboard: combinedKeyboard
                        }
                    });
                }
            })
            .catch((error) => {
                console.error(`Error checking membership: ${error.message}`);
            });
            break;

        case 'join_channels':
            showChannels(chatID, requiredChannels);
            break;

        case 'youtube_channels':
            const youtubeChannels = [
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
            ];

            bot.sendMessage(chatID, 'Subscribe to our YouTube channels:', {
                reply_markup: {
                    inline_keyboard: youtubeChannels
                }
            });
            break;

        case 'start':
            bot.sendMessage(chatID, 'Welcome to Binance Red Packet Bot! This bot helps you earn USDT and BTTC effortlessly by completing simple tasks like watching videos, engaging with content, and more. It\'s easy, fun, and rewarding — start earning cryptocurrency today!');
            bot.sendMessage(chatID, 'Select an option:', {
                reply_markup: {
                    inline_keyboard: mainKeyboard
                }
            })
            break;
            
            case 'refresh':
                const keyboard = mainKeyboard; // Define the keyboard variable
                checkMembership(chatID, requiredChannels)
                .then((isMember) => {
                    if (isMember) {
                        const webButton = [
                            [
                                {
                                    text: 'Open Web',
                                    web_app: {
                                        url: 'https://cryptic-caverns-38004-f55e3bfbd857.herokuapp.com/'
                                    }
                                }
                            ]
                        ];
            
                        const combinedKeyboard = [...keyboard, ...webButton];
            
                        bot.sendMessage(chatID, 'Select an option:', {
                            reply_markup: {
                                inline_keyboard: combinedKeyboard
                            }
                        });
                    } else {
                        bot.sendMessage(chatID, 'You have not joined all required channels!');
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
                break;

        default:
            bot.sendMessage(chatID, 'Invalid option');
    }
});

//Function to show channels
function showChannels(chatID, channels) {
    const telegramChannels = channels.map((channel) => [
        {
            text: channel.name,
            url: channel.link 
        }
    ]);

    const youtubeButton = [
        [
            {
                text: 'Subscribe to our YouTube channels',
                callback_data: 'youtube_channels'
            }
        ]
    ];

    const combinedKeyboard = [...telegramChannels, ...youtubeButton];

    bot.sendMessage(chatID, 'Join the following Telegram channels:', {
        reply_markup: {
            inline_keyboard: combinedKeyboard
        }
    });
}

//Function to check if user is a member of all required channels and groups
async function checkMembership(chatID, requiredChannels) {
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
        bot.sendMessage(chatID, 'Error checking membership. Please try again later.');
        return false;
    }
}