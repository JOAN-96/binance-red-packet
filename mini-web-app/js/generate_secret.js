const crypto = require('crypto');

const secretValue = crypto.randomBytes(32).toString('hex');
console.log(secretValue);