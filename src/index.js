const TelegramBot = require('node-telegram-bot-api');
const axios =require('axios');
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
    }/*,

    //Channel 3
    {
        name: 'Channel 3',
        link: 'https://t.me/channel3'
    }
    */
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

    [
        {
            text: 'Start',
            callback_data: 'start'
        }
    ]
];

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
        bot.sendMessage(chatID, 'Welcome to Binance Red Packet');
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
        if (isMember) {
            //User is a member of all required channels and groups, show keyboard
            bot.sendMessage(chatID, 'Select an option:', {
                reply_markup: {
                    inline_keyboard: keyboard
                    }
                });
            } else {
            //User is not a member of all required channels and groups, show join channels and groups buttons
                bot.sendMessage(chatID, 'Join all required channels and groups before accessing the mini web app!', {
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
            break;

        case 'join_channels':
            bot.sendMessage(chatID, 'Kindly join all our channels as they are necessary in order to access the web: ' + requiredChannels.join(', '));
            break;

        /*case 'join_group':
            bot.sendMessage(chatID, 'Kindly join all our groups as they are necessary in order to access the web: ' + requiredGroups.join(', '));
            break;*/

        case 'start':
            bot.sendMessage(chatID, 'Welcome to Binance Red Packet');
            bot.sendMessage(chatID, 'Select an option:', {
                reply_markup: {
                    inline_keyboard: keyboard
                }
            })
            break;

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

    bot.sendMessage(chatID, 'Kindly join the following channels:', {
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
            if (!getChatMember.status !== 'member' && getChatMember.status !== 'administrator' && chatMember.status !== 'creator') {
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