const expressSession = require('express-session');
require('dotenv').config();
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  console.error('SESSION_SECRET environment variable is missing');
  throw new Error('Missing required environment variables');
} else {
  console.log('SESSION_SECRET loaded successfully'); // Optional: Add logging if you want to confirm loading
}

const sessionConfig = {
  name: 'session',
  secret: sessionSecret, // Now ensure it's always the environment variable in production
  resave: false,
  saveUninitialized: true,
  cookie: {
    // Set max age to 7 days
    maxAge: 1000 * 60 * 60 * 24 * 7,
    // Set secure to true if using HTTPS, false otherwise
    secure: process.env.NODE_ENV === 'production', // Set to false if you're not using HTTPS
    httpOnly: true,
    sameSite: 'lax'  // Helps protect against CSRF attacks
  },
};

module.exports = sessionConfig;