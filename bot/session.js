const expressSession = require('express-session');
/* const Redis = require('ioredis'); 

const redisUrl = process.env.REDISCLOUD_URL; */
const sessionSecret = process.env.SESSION_SECRET;

if (/* !redisUrl || */ !sessionSecret) {
  throw new Error('Missing required environment variables');
}
/*
const redisClient = new Redis({
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
}); */
/*
const RedisStore = ConnectRedis(expressSession); */

const sessionConfig = {
  name: 'session',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  /* store: new RedisStore({ client: redisClient, disableTouch: true }), */
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    secure: true,
    httpOnly: true,
  },
};

module.exports = sessionConfig;
/*
try {
  const sessionConfig = {
    name: 'session',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new expressSession.Store({ client: redisClient, }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, 
      secure: true, 
      httpOnly: true,
    },
  };
  module.exports = sessionConfig;
} catch (error) {
  console.error('Error configuring session:', error);
  process.exit(1);
} */