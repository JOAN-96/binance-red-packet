const expressSession = require('express-session');
const { createClient } = require('redis');
const ConnectRedis = require('connect-redis');

const redisUrl = process.env.REDISCLOUD_URL;
const redisClient = createClient({
  url: redisUrl,
  legacyMode: true,
});

redisClient.ping((err, res) => {
  if (err) {
    console.error('Redis connection failed:', err);
  } else {
    console.log('Redis connection established:', res);
  }
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

const RedisStore = ConnectRedis(expressSession);

const sessionConfig = {
  name: 'session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({ client: redisClient, disableTouch: true }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, 
    secure: true, 
    httpOnly: true,
  },
};

module.exports = sessionConfig;