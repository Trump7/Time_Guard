const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    short: String,
    rfid: {type: String, unique: true},
    row: {type: Number, unique: true},
    totalHours: {type: Number, default: 0}
}, {collection: 'Users'});

module.exports = mongoose.model('User', UserSchema);