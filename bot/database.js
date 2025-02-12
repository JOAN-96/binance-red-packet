// database.js
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

const createUserTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_username VARCHAR(255) UNIQUE,
        amount INTEGER DEFAULT 0
      );
    `);
  } catch (error) {
    console.error(error);
  }
};

createUserTable();

const getUser = async (telegramUsername) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE telegram_username = $1', [telegramUsername]);
    return result.rows[0];
  } catch (error) {
    console.error(error);
  }
};

const createUser = async (telegramUsername) => {
  try {
    await pool.query('INSERT INTO users (telegram_username) VALUES ($1)', [telegramUsername]);
  } catch (error) {
    console.error(error);
  }
};

const updateUserAmount = async (telegramUsername, amount) => {
  try {
    await pool.query('UPDATE users SET amount = $1 WHERE telegram_username = $2', [amount, telegramUsername]);
  } catch (error) {
    console.error(error);
  }
};

module.exports = { getUser, createUser, updateUserAmount };