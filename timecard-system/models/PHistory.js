const mongoose = require('mongoose');

const PayrollHistory = new mongoose.Schema({
    fileName: String,
    periodEndDate: Date,
    filePath: String,
    isFinal: Boolean
}, {collection: 'PayrollHistory'});

module.exports = mongoose.model('PHistory', PayrollHistory);