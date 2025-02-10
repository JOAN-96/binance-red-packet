const bot = require('./index').bot;
const channels = require('./channels');
/*const keyboards = require('./keyboards');*/

module.exports = {
    sendWelcomeMessage: async (chatID) => {
        try {
            const telegramChannels = channels.requiredChannels.map((channel) => [
                 {
                     text: channel.name,
                    url: channel.link
                }
            ]);
        
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
        
            const combinedKeyboard = [...telegramChannels, youtubeChannels];
        
            await bot.sendMessage(chatID, 'Please join the channels and subscribe to the YouTube channels:', {
                reply_markup: {
                    inline_keyboard: combinedKeyboard
                }
            });
            } catch (error) {
                console.error(`Error sending welcome message: ${error}`);
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
            console.error(`Error sending keyboard: ${error}`);
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