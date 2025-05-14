require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./User'); // Import the User model


// Check if the connection was successful
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI environment variable is missing');
  throw new Error('Missing required environment variables');
}

// Connect to MongoDB using the connection string from environment variables

async function connectDB() {
  try {
    console.log("Connecting to MongoDB with URI:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
    useUnifiedTopology: true,
    });
    console.log("✅ Successfully connected to MongoDB");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
    throw err;
  }
}


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('MongoDB connection opened');
});


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


module.exports = { 
  connectDB,
  getUser, 
  createUser, 
  updateUserAmount
 };