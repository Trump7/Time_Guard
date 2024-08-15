const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
    fileName: String,
    periodEndDate: Date,
    filePath: String,
    isFinal: Boolean
}, {collection: 'PayrollHistory'});

module.exports = mongoose.model('PHistory', PayrollSchema);