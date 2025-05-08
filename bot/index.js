require('dotenv').config();
const express = require('express');
const { bot, handleStartCommand, handleWebappCommand, handleBalanceCommand, setWebHook, token } = require('./telegram');
const server = require('./backend/server');

const token = process.env.BOT_TOKEN; 
if (!token) {
  throw new Error('BOT_TOKEN is missing from .env file');
}

const router = express.Router();

// === Webhook route (for Telegram webhook calls) ===
router.post(`/bot${token}`, async (req, res) => {
  const message = req.body.message;
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
  botRouter: router,
  token
};
