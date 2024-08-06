const mongoose = require('mongoose');

const TimecardSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    clockIn: Date,
    clockOut: {type: Date, default: null},
    status: {type: String, default: 'Active'}
}, {collection: 'Entries'});

module.exports = mongoose.model('Entries', TimecardSchema);