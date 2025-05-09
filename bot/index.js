require('dotenv').config();
const express = require('express');
const { bot, handleStartCommand, handleWebappCommand, handleBalanceCommand, setWebHook } = require('./telegram');

const token = process.env.TELEGRAM_TOKEN; 
if (!token) {
  throw new Error('TELEGRAM_TOKEN is missing from .env file');
}

const botRouter = express.Router();

// === Webhook route (for Telegram webhook calls) ===
botRouter.post(`/bot${token}`, async (req, res) => {
  const message = req.body.message;
  console.log('Incoming Telegram update:', JSON.stringify(req.body, null, 2));  // Debug log
  
  // Check if the message is valid
  if (message && message.text) {
    const text = message.text.trim();

    if (text === '/start') {
      await handleStartCommand(message);
    } else if (text === '/webapp') {
      await handleWebappCommand(message.chat.id, message.from.username);
    } else if (text === '/balance') {
      await handleBalanceCommand(message);
    }
  }
  res.sendStatus(200);
});

// === Export bot + botRouter ===
module.exports = {
  bot,
  botRouter,
  setWebHook,
  token
};
