const keyboards = require('./keyboards');
const utils = require('./utils');
const bot = require('./index').bot;

module.exports = {
    messageHandler: async (msg) => {
        try {
            const chatID = msg.chat.id;
            const text = msg.text;

            if (text === '/start') {
                await utils.sendWelcomeMessage(bot, chatID);
            }

            /*const combinedKeyboards = [...keyboards.mainKeyboard, keyboards.webButton];
            utils.sendKeyboard(chatID, combinedKeyboards);*/

            // Check membership
            /*const isMember = await utils.checkMembership(chatID);
            if (isMember) {
                utils.sendKeyboard(chatID, keyboards.mainKeyboard);
            } else {
                utils.showChannels(chatID);
            }*/
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