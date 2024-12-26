const TelegramBot = require('node-telegram-bot-api');
const axios =require('axios');
const express = require('express');
require('dotenv').config();

//Token gotten from BotFather
const token = process.env.Telegram_Token;

const bot = new TelegramBot(token, {polling:true});

//Required Channels
const requiredChannels = [
    
    //Channel 1
    {
        name: 'Queen Tech',
        link: 'https://t.me/Queenteac'
    },
    
    //Channel 2
    {
        name: 'Crypto Levy',
        link: 'https://t.me/Cryptolevychannel'
    },

    //Channel 3
    {
        name: 'Cash Megan',
        link: 'https://t.me/Cashmegan'
    },

    //Channel 4
    {
        name: 'Red Packet',
        link: 'https://t.me/BinanceredpacketBott'
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
const keyboard = [
    [
        {
            text: 'Help',
            callback_data: 'help'
        },

        {
            text: 'About',
            callback_data: 'about'
        }
    ],

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

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Welcome to Binance Red Packet Bot! This bot helps you earn USDT and BTTC effortlessly by completing simple tasks like watching videos, engaging with content, and more. It\'s easy, fun, and rewarding—start earning cryptocurrency today!');
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

bot.on('message', (msg) => {
    console.log(msg);
    const chatID = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        bot.sendMessage(chatID, 'Welcome to Binance Red Packet Bot! This bot helps you earn USDT and BTTC effortlessly by completing simple tasks like watching videos, engaging with content, and more. It\'s easy, fun, and rewarding—start earning cryptocurrency today!');
        //Show keyboard
        bot.sendMessage(chatID, 'Select an option:', {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } else {
        //Check membership
        checkMembership(chatID, requiredChannels/*, requiredGroups*/)
        .then((isMember) => {
            console.log (`Is member: ${isMember}`);
            if (isMember) {
            //User is a member of all required channels and groups, show keyboard
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

                const combinedKeyboard = [...keyboard, [webButton]];

            bot.sendMessage(chatID, 'Select an option:', {
                reply_markup: {
                    inline_keyboard: combinedKeyboard
                    }
                });
            } else {
            //User is not a member of all required channels and groups, show join channels and groups buttons
                bot.sendMessage(chatID, 'To use this bot, you must join the following channels:', {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Join Channels',
                                    callback_data: 'join_channels'
                                }/*,

                                {
                                    text: 'Join Groups',
                                    callback_data: 'join_groups'
                                }*/
                            ]
                        ]
                    }
                });
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
        case 'help':
            bot.sendMessage(chatID, 'Need help in understanding the bot? Contact us');
            break;

        case 'about':
            bot.sendMessage(chatID, 'With Binance Red Packet Video, you are rewarded for watching short video daily and earn other rewards by performing other tasks');
            break;
        
        case 'channels':
            showChannels(chatID, requiredChannels);
            checkMembership(chatID, requiredChannels)
            .then((isMember) => {
                if (isMember) {
                    const webButton = [
                        {
                            text: 'Open Web',
                            web_app: {
                                url: 'https://your-web-app-url.com'
                            }
                        }
                    ];

                    const combinedKeyboard = [...keyboard, [webButton]];

                    bot.sendMessage(chatID, 'Select an option:', {
                        reply_markup: {
                            inline_keyboard: combinedKeyboard
                        }
                    });
                }
            })
            .catch((error) => {
                console.error(error);
            });
            break;

        case 'join_channels':
            bot.sendMessage(chatID, 'To use this bot, you must join the following channels:' + requiredChannels.join(', '));
            break;

        /*case 'join_group':
            bot.sendMessage(chatID, 'Kindly join all our groups as they are necessary in order to access the web: ' + requiredGroups.join(', '));
            break;*/

        case 'start':
            bot.sendMessage(chatID, 'Welcome to Binance Red Packet Bot! This bot helps you earn USDT and BTTC effortlessly by completing simple tasks like watching videos, engaging with content, and more. It\'s easy, fun, and rewarding—start earning cryptocurrency today!');
            bot.sendMessage(chatID, 'Select an option:', {
                reply_markup: {
                    inline_keyboard: keyboard
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
    const keyboard = channels.map((channel) => [
        {
            text: channel.name,
            url: channel.link 
        }
    ]);

    bot.sendMessage(chatID, 'Join the channels and subscribe to the YouTube channels', {
        reply_markup: {
            inline_keyboard: keyboard
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
            console.log(`Chat member status for ${channel.name}: ${chat.status}`);
            if (!chat.status !== 'member' && chat.status !== 'administrator' && chat.status !== 'creator') {
            isMember = false;
            break;
            }
        } catch (error) {
            console.error(error);
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