const crypto = require('crypto');
function verifyTelegramAuth(telegramAuth) {
  const telegramAuthHash = crypto.createHash('sha256');
  telegramAuthHash.update(process.env.TELEGRAM_AUTH_HASH_SECRET);
  const hash = telegramAuthHash.digest('hex');

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(telegramAuth));
}

module.exports = verifyTelegramAuth;