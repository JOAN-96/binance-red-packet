// database.js
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the User schema
const userSchema = new mongoose.Schema({
  telegramId: Number,
  username: String,
  firstName: String,
  lastName: String,
  walletBalance: {type: Number, default: 0},
});

// Create a User model
const User = mongoose.model('User', userSchema);

// Function to create a new user based on Telegram user info
async function createUser(telegramUser) {
  const existingUser = await User.findOne({ telegramId: telegramUser.id });
  if (existingUser) {
    // Return the existing user document
    return existingUser;
  } else {
    // Create a new user document
    const newUser = new User({
      telegramId: telegramUser.id,
      username: telegramUser.username,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      walletBalance: 0, // Initialize wallet balance to 0
    });
    await newUser.save();
    return newUser;
  }
}

// Function to get a user document based on Telegram user ID
async function getUser(telegramId) {
  return User.findOne({ telegramId });
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