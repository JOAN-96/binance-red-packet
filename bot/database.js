const mongoose = require('mongoose');
const User = require('./User'); // Import the User model
require('dotenv').config();

// Check if the connection was successful
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI environment variable is missing');
  throw new Error('Missing required environment variables');
}

// Connect to MongoDB using the connection string from environment variables
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Successfully connected to MongoDB");
})
.catch((err) => {
  console.error("Error connecting to MongoDB:", err);
});

const db = mongoose.connection;

/*db.on('error', (error) => {
  console.error('Error connecting to MongoDB:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
}); */

// Define the User schema
const userSchema = new mongoose.Schema({
  telegramId: Number,
  username: String,
  firstName: String,
  lastName: String,
  walletBalance: { type: Number, default: 0 },
}, {timestamps: true}); // Add timestamps to the schema


// Function to get a user document based on Telegram user ID or username
async function getUser(userId) {
  return await User.findOne({ telegramId: userId });
}

// Function to create a new user based on Telegram user info
async function createUser(userId, username) {
  const newUser = new User({
    telegramId: userId,
    username,
    walletBalance: 0,
    videoWatchStatus: { video1: false, video2: false, video3: false }
  });
  return await newUser.save();
}

// Function to update the wallet balance of a user
async function updateUserAmount(userId, amount) {
  try {
    if (typeof amount !== 'number') {
      throw new Error(`Invalid amount: ${amount}. Must be a number.`);
    }
    const user = await getUser(userId);
    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return;
    } 

    // Update walletBalance instead of amount
    user.walletBalance = amount; 
    await user.save();
    console.log(`Updated wallet balance for ${user.username}: ${amount}`);
  } 
  catch (error) {
    console.error('Error updating user amount:', error);
  }
}

module.exports = { getUser, createUser, updateUserAmount };