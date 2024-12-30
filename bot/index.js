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
        link: 'CHANNEL_QUEEN_TECH'
    },
    
    //Channel 2
    {
        name: 'Crypto Levy',
        link: 'CHANNEL_CRYPTO_LEVY'
    },

    //Channel 3
    {
        name: 'Cash Megan',
        link: 'CHANNEL_CASH_MEGAN'
    },

    //Channel 4
    {
        name: 'Red Packet',
        link: 'CHANNEL_RED_PACKET'
    }
];

//Required Groups
/*
const requiredGroups = [

    //Group 1
    {
        name: 'Group 1',
        link: 'https://t.me/group1'
    },

    //Group 2
    {
        name: 'Group 2',
        link: 'https://t.me/group2'
    }
];
*/

//Bot Function List
// Main keyboard
const mainKeyboard = [
    /*[
        {
            text: 'Help',
            callback_data: 'help'
        },

        {
            text: 'About',
            callback_data: 'about'
        }
    ],*/

    [
        {
            text: 'Channels',
            callback_data: 'channels'
        }/*,

        {
            text: 'Groups',
            callback_data: 'groups'
        }
        */
    ],

    [
        {
            text: 'Start',
            callback_data: 'start'
        }
    ]/*,

    [
        {
            text: 'Refresh',
            callback_data: 'refresh'
        }
    ]*/
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
    res.send('Welcome to Binance Red Packet Bot! This bot helps you earn USDT and BTTC effortlessly by completing simple tasks like watching videos, engaging with content, and more. It\'s easy, fun, and rewarding - start earning cryptocurrency today!');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

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
    const welcomeText = 'Welcome to Binance Red Packet Bot! This bot helps you earn USDT and BTTC effortlessly by completing simple tasks like watching videos, engaging with content, and more. It\'s easy, fun, and rewarding - start earning cryptocurrency today! Join the channels and subscribe to the YouTube channels to get started.';

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

    bot.sendMessage(chatID, welcomeText);
    bot.sendMessage(chatID, 'Join the following Telegram channels and subscribe to our YouTube channels:', {
        reply_markup: {
            inline_keyboard: combinedKeyboard
        }
    });
}

bot.on('message', (msg) => {
    console.log('Received message:', msg);
    const chatID = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        /*bot.sendMessage(chatID, 'Hello!', {
            reply_markup: {
                inline_keyboard: keyboard
            }
        })*/
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
            };  

        //Check membership
        checkMembership(chatID, requiredChannels/*, requiredGroups*/)
        .then((isMember) => {
            console.log (`Is member: ${isMember}`);
            if (isMember) {
                //User is a member of all required channels and groups, show keyboard
                const webButton = [
                    [
                        {
                            text: 'Open web',
                            web_app: {
                                url: 'https://your-web-app-url.com'
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
    }
});

bot.on('callback_query', (query) => {
    console.log('Received callback query:', query);
    const chatID = query.message.chat.id;
    const data = query.data;

    switch (data) {
        /*case 'help':
            bot.sendMessage(chatID, 'Need help in understanding the bot? Contact us');
            break;

        case 'about':
            bot.sendMessage(chatID, 'With Binance Red Packet Video, you are rewarded for watching short video daily and earn other rewards by performing other tasks');
            break;*/
        
        case 'channels':
            showChannels(chatID, requiredChannels);
            checkMembership(chatID, requiredChannels)
            .then((isMember) => {
                if (!isMember) {
                    const webButton = [
                        {
                            text: 'Open Web',
                            web_app: {
                                url: 'https://your-web-app-url.com'
                            }
                        }
                    ];

                    const combinedKeyboard = [...mainKeyboard, [webButton]];

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

        /*case 'join_group':
            bot.sendMessage(chatID, 'Kindly join all our groups as they are necessary in order to access the web: ' + requiredGroups.join(', '));
            break;*/

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
            
        /*case 'refresh':
            checkMembership(chatID, requiredChannels)
            .then((isMember) => {
                if (isMember) {
                    const webButton = [
                        [
                            {
                                text: 'Open Web',
                                web_app: {
                                    url: 'https://your-web-app-url.com'
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
            break;*/

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
            inline_keyboard: telegramChannels
        }
    });
}
/*
//Function to show groups
function showGroups(chatID, groups) {
    const keyboard = groups.map((group) => [
        {
            text: group.name,
            url: group.link
        }
    ]);

    bot.sendMessage(chatID, 'Kindly join the following groups:', {
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
}*/

//Function to check if user is a member of all required channels and groups
async function checkMembership(chatID, requiredChannels/*, requiredGroups*/) {
    let isMember = true;

    //Check membership in channels
    for (const channel of requiredChannels) {
        try {
            const chat = await bot.getChatMember(channel.link.split('/').pop(), chatID);
            /*console.log(`Chat member status for ${channel.name}: ${chat.status}`);*/
            if (chat.status !== 'member' && chat.status !== 'administrator' && chat.status !== 'creator') {
            isMember = false;
            break;
            }
        } catch (error) {
            console.error(`Error checking memebership in ${channel.name}: ${error.message}`);
            isMember = false;
            break;
        }
    }
/*
    //Check membership in groups
    for (const group of requiredGroups) {
        try {
            const chatMember = await bot.getChatMember(group.link.split('/').pop(), chatID);
            if (!chatMember.status !== 'member' && chatMember.status !== 'administrator' && chatMember.status !== 'creator') {
            isMember = false;
            break;
            }
        } catch (error) {
        console.error(error);
        isMember = false;
        break;
        }
    }*/

    return isMember;
}