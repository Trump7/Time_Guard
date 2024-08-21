const express = require('express');
const router = express.Router();
const Timecard = require('../models/Timecard');
const { verifyDeviceToken } = require('../middleware/authMiddleware');

//Function for Arduino
router.post('/', verifyDeviceToken, async(req, res) => {
    const result = await Timecard.updateMany(
        {clockOut: null, clockIn: { $lt: new Date().setHours(0,0,0,0)}},
        {status: 'Did not clock out', clockOut: 'N/A'}
    );
    res.send(result);
});

module.exports = router;