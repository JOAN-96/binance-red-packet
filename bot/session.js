const expressSession = require('express-session');
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error('Missing required environment variables');
}

const sessionConfig = {
  name: 'session',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, 
    secure: true, // Set to false if you're not using HTTPS
    httpOnly: true,
  },
};

module.exports = sessionConfig; 
