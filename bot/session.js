// session.js
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const redis = require('redis');

const redisUrl = process.env.REDISCLOUD_URL
const redisClient = redis.createClient({
  url: 'redisUrl',
  legacyMode: true,
});

const sessionConfig = {
  name: 'session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({ client: redisClient }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    secure: true, // Set to true for HTTPS
    httpOnly: true,
  },
};

module.exports = sessionConfig;