const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// const { app } = require('../backend/server');  // Import Express app from server.js

const { getUser, createUser, updateUserAmount } = require('./database');
const User = require('./User');


//Token gotten from BotFather
const token = process.env.TELEGRAM_TOKEN;

// Initialize the bot (not using polling)
const bot = new TelegramBot(token, { webHook: true }); // Automatically call webHook

const debug = true;

// Set webhook for Telegram bot using the BASE_URL and the token
// bot.setWebHook(`${process.env.BASE_URL}/bot${token}`); 

// Use the webhook callback in your Express app
// app.use(bot.webhookCallback(`/bot${token}`));


// Bot commands
bot.setMyCommands([
    {
         command: 'start',
         description: 'Start the bot'
    }, 
    {
        command: 'webapp',
        description: 'Launch',
        /* type: 'web_app',
        web_app: {
            url: WEB_APP_URL  // Heroku app URL 
        } */
    },
    {
        command: 'balance',
        description: 'Check your wallet balance'
    }
]);

// === Command Handlers ===

// Function to handle the /start command
async function handleStartCommand(msg) {
    const chatID = msg.chat.id;
    const telegramUsername = msg.from.username;
    const telegramId = msg.from.id;

    // Authenticate users and store their  Telegram username in the database
    const user = await getUser(telegramId);
    if (!user) {
        // Create a new user
        await createUser(telegramId, telegramUsername);
    }

    // Welcome Message
    const welcomeText = 'Join all the Telegram channels and subscribe to our YouTube channels to get the latest updates and get the best use of the bot!';

    // Telegram Channels Keyboard
    const telegramChannelsText = 'Telegram Channels:';
    const telegramChannelsKeyboard = [
        [
            {
                text: 'Crypto Levy',
                /* callback_data: 'channel_cryptolevy' */
                url: 'https://t.me/Cryptolevychannel'
            },
            {
                text: 'Cash Megan',
                /* callback_data: 'channel_cashmegan' */
                url: 'https://t.me/Cashmegan'
            }
        ]
    ];

    // YouTube Channels Keyboard
    const youtubeChannelsText = 'YouTube Channels:';
    const youtubeChannelsKeyboard = [
        [
            {
                text: 'Crypto Levy YouTube',
                /* callback_data: 'youtube_cryptolevy' */
                url: 'https://www.youtube.com/@cryptolevy?si=QXQimY13s4CSMaPu'
            },
            {
                text: 'Cash Megan YouTube',
                /* callback_data: 'youtube_cashmegan' */
                url: 'https://www.youtube.com/@cashmega?si=I7MIP1Hcpou3nAeY'
            }
        ]
    ];

    // Send the wecome message
    await bot.sendMessage(chatID, welcomeText,);

    // Send the Telegram Channels Message
    await bot.sendMessage(chatID, telegramChannelsText, {
        reply_markup: {
            inline_keyboard: telegramChannelsKeyboard
        }
    });

    // Send the YouTube Channels Message
    await bot.sendMessage(chatID, youtubeChannelsText, {
        reply_markup: {
            inline_keyboard: youtubeChannelsKeyboard
        }
    });

    // Return a response to acknowledge the webhook handler
    return 'Welcome message and links sent!';
}

// Function to handle the /webapp command
async function handleWebappCommand(userId, username) {
    try {
        // Fallback if no username
        const safeUsername = username || 'user';

        // Heroku app URL
        const webAppUrl = process.env.BASE_URL;
        
        // This message will be returned to the webhook handler for logging (optional)
        const messageText = 'Click the button below to open the Web App 👇';
        
        // Send the message with the Web App button
        await bot.sendMessage(userId, messageText, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Open Web App',
                            web_app: {
                                url: webAppUrl // Heroku app URL
                            }
                        }
                    ]
                ]
            }
        });
    } catch (error) {
        console.error('Error sending Web App button:', error);
        await bot.sendMessage(userId, 'Sorry, an error occurred while sending the Web App button. Please try again later!');
    }
    return 'Web app button sent!';
}


// Function to log wallet update 
async function logWalletUpdate(userId, incrementValue = 1000) {
    try {
      const user = await getUser(userId);
      if (user) {
        console.log(`User ${user.username}'s wallet balance: ${user.walletBalance}`);
        // Example of a wallet update action (adjust this based on your app logic)
        const newBalance = user.walletBalance + incrementValue; // For example, adding 1000 to the balance
        await updateUserAmount(userId, newBalance);
        console.log(`Updated wallet balance for ${user.username}: ${newBalance}`);
      }
    } catch (error) {
      console.error('Error updating wallet balance:', error);
    }
  }
  

// Function to handle the /balance command
async function handleBalanceCommand(msg) {
    const chatID = msg.chat.id;
    const telegramId = msg.from.id;

    try {
        const user = await getUser(telegramId);
        if (!user) {
            await bot.sendMessage(chatID, 'You are not registered yet. Please use /start first.');
            return;
        }

        await bot.sendMessage(chatID, `Your wallet balance is: ${user.walletBalance}`);
    } catch (error) {
        console.error(`Error handling /balance command: ${error}`);
        await bot.sendMessage(chatID, 'Sorry, an error occurred while fetching your balance.');
    }
}


bot.on('callback_query', async (query) => {
    try {
        console.log(`Received callback query from ${query.from.username}: ${query.data}`);
        await bot.answerCallbackQuery(query.id, { text: 'Link opended!' });
    } catch (error) {
        console.error(`Error handling callback query: ${error}`);
    }
});

bot.on('error', (error) => {
    console.error('Telegram Bot Error:', error);
});


// === Export bot and helper functions ===
module.exports = {
    bot,
    handleStartCommand,
    handleWebappCommand,
    handleBalanceCommand,
    logWalletUpdate,
    setWebHook: bot.setWebHook.bind(bot), // Make setWebHook available for index.js
    token
  };


// Make token available for other modules
bot.token = token;