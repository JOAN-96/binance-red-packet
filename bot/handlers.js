/* const keyboards = require('./keyboards');
const utils = require('./utils');
const bot = require('./index').bot;

module.exports = (bot, keyboards, utils) => {
    return {
        messageHandler: async (msg) => {
            try {
                const chatID = msg.chat.id;
                const text = msg.text;
    
                if (text === '/start') {
                    await utils.sendWelcomeMessage(bot, chatID);
                }
            } catch (error) {
                console.error(`Error handling message: ${error}`);
            }
        },
    
        callbackQueryHandler: async (query) => {
            try {
                const chatID = query.message.chat.id;
                const data = query.data;
    
                switch (data) {
                    case 'channels':
                        utils.showChannels(chatID);
                        break;
    
                    case 'youtube_channels':
                        const youtubeChannels = [
                            [
                              {
                                text: 'Queen Tech',
                                url: 'https://www.youtube.com/watch?v=hmSSQv4AyGU'
                              }
                            ],
                            [
                              {
                                text: 'Crypto Levy',
                                url: 'https://www.youtube.com/@cryptolevy?si=QXQimY13s4CSMaPu'
                              }
                            ],
                            [
                              {
                                text: 'Mega Cash',
                                url: 'https://www.youtube.com/@cashmega?si=I7MIP1Hcpou3nAeY'
                              }
                            ]
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
                console.error(`Error handling callback query: ${error}`);
            }
        }
    };
}; 
*/

const utils = require('./utils');
const bot = require('./index').bot;

module.exports = (bot, utils) => {
    return {
        messageHandler: async (msg) => {
            try {
                const chatID = msg.chat.id;
                const text = msg.text;

                if (text === '/start') {
                    await utils.sendWelcomeMessage(bot, chatID);
                }
            } catch (error) {
                console.error(`Error handling message: ${error}`);
            }
        },

        callbackQueryHandler: (query) => {
            const chatId = query.message.chat.id;
            const data = query.data;

            if (data === 'start') {
                bot.sendMessage(chatId, 'Welcome! You have clicked the start button.');
            } else {
                console.log(`Unknown command data: ${data}`);
            }

            bot.answerCallbackQuery(query.id);
        }
    };
};