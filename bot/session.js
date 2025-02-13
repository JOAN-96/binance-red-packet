const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const { createClient } = require('redis');

const redisUrl = process.env.REDISCLOUD_URL;
const redisClient = createClient({
  url: redisUrl,
  legacyMode: true,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

const sessionConfig = {
  name: 'session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({ client: redisClient }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, 
    secure: true, 
    httpOnly: true,
  },
};

module.exports = sessionConfig;