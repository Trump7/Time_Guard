const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true},
}, { collection: 'Administrator' });

module.exports = mongoose.model('Account', userSchema);