const channels = require('./channels');
/*const keyboards = require('./keyboards');*/

module.exports = {
    sendWelcomeMessage: async (bot, chatID) => {
        try {
            const telegramChannels = channels.requiredChannels.map((channel) => [
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
        
            const combinedKeyboard = [...telegramChannels, youtubeButton];
        
            await bot.sendMessage(chatID, 'Join our Telegram channels and subscribe to the YouTube channels:', {
                reply_markup: {
                    inline_keyboard: combinedKeyboard
                }
            });
            } catch (error) {
                console.error(`Error sending welcome message to chat ${chatID}: ${error}`);
            }
    },

    sendKeyboard: async (bot, chatID, keyboard) => {
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
            const telegramChannels = channels.requiredChannels.map((channel) => [
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
            for (const channel of channels.requiredChannels) {
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