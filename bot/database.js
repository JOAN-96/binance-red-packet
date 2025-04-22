const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Error connecting to MongoDB:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define the User schema
const userSchema = new mongoose.Schema({
  telegramId: Number,
  username: String,
  firstName: String,
  lastName: String,
  walletBalance: { type: Number, default: 0 },
});

// Create a User model
const User = mongoose.model('User', userSchema);

// Function to create a new user based on Telegram user info
async function createUser(telegramId, telegramUsername) {
  const existingUser = await User.findOne({ telegramId });
  if (existingUser) {
    // Return the existing user document
    return existingUser;
  } else {
    // Create a new user document
    const newUser = new User({
      telegramId,
      username: telegramUsername,
      firstName: '',
      lastName: '',
      walletBalance: 0, // Initialize wallet balance to 0
    });
    await newUser.save();
    return newUser;
  }
}

// Function to get a user document based on Telegram user ID or username
async function getUser(telegramIdOrUsername) {
  if (typeof telegramIdOrUsername === 'number') {
    return User.findOne({ telegramId: telegramIdOrUsername });
  } else {
    return User.findOne({ username: telegramIdOrUsername });
  }
}

// Function to update the wallet balance of a user
async function updateUserAmount(userId, amount) {
  try {
    const user = await getUser(userId);
    if (user) {
      user.walletBalance = amount; // Update walletBalance instead of amount
      await user.save();
    } else {
      console.error(`User with ID ${userId} not found`);
    }
  } catch (error) {
    console.error('Error updating user amount:', error);
  }
}

module.exports = { User, createUser, getUser, updateUserAmount };