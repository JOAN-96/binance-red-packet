const mongoose = require('mongoose');
require('dotenv').config();


// Check if the connection was successful
/*mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
}).on('error', (error) => {
  console.error('Error connecting to MongoDB:', error);
}); */

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
    if (typeof amount !== 'number') {
      throw new Error(`Invalid amount: ${amount}. Must be a number.`);
    }
    const user = await getUser(userId);
    if (user) {
      user.walletBalance = amount; // Update walletBalance instead of amount
      await user.save();
      console.log(`Updated wallet balance for ${user.username}: ${amount}`);
    } else {
      console.error(`User with ID ${userId} not found`);
    }
  } catch (error) {
    console.error('Error updating user amount:', error);
  }
}


module.exports = { User, createUser, getUser, updateUserAmount };