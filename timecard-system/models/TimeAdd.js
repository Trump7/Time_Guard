const mongoose = require('mongoose');

const TimeAddSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    hours: Number,
    message: {type: String},
    status: {type: String, default: 'Completed'}
}, {collection: 'Entries'});

module.exports = mongoose.model('Entries', TimeAddSchema);