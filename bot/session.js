<<<<<<< HEAD
const expressSession = require('express-session');
require('dotenv').config();
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  console.error('SESSION_SECRET environment variable is missing');
  throw new Error('Missing required environment variables');
}

const sessionConfig = {
  name: 'session',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    // Set max age to 7 days
    maxAge: 1000 * 60 * 60 * 24 * 7,
    // Set secure to true if using HTTPS, false otherwise
    secure: process.env.NODE_ENV === 'production', // Set to false if you're not using HTTPS
    httpOnly: true,
  },
};

=======
const expressSession = require('express-session');
require('dotenv').config();
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  console.error('SESSION_SECRET environment variable is missing');
  throw new Error('Missing required environment variables');
}

const sessionConfig = {
  name: 'session',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    // Set max age to 7 days
    maxAge: 1000 * 60 * 60 * 24 * 7,
    // Set secure to true if using HTTPS, false otherwise
    secure: process.env.NODE_ENV === 'production', // Set to false if you're not using HTTPS
    httpOnly: true,
  },
};

>>>>>>> a9c8ac1bdad1bb6a06977940bf790e7e8f01c208
module.exports = sessionConfig;