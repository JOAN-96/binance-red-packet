const keyboards = require('./keyboards');
const utils = require('./utils');
const bot = require('./index').bot;

module.exports = {
    messageHandler: async (msg) => {
        try {
            const chatID = msg.chat.id;
            const text = msg.text;

            if (text === '/start') {
                await utils.sendWelcomeMessage(bot, chatID, keyboards.mainKeyboard);
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
                    utils.sendYouTubeChannels(chatID);
                    break;

                // Handle other callback queries
            }
        } catch (error) {
            console.error(`Error handling callback query: ${error}`);
        }
    }
};