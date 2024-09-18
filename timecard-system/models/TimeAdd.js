const mongoose = require('mongoose');

const TimeAddSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    hoursAdded: Number,
    date: Date,
    message: {type: String},
    status: {type: String, default: 'Completed'}
}, {collection: 'Entries'});

module.exports = mongoose.model('TimeAdd', TimeAddSchema);