const express = require('express');
const router = express.Router();
const Timecard = require('../models/Timecard');
const { verifyDeviceToken } = require('../middleware/authMiddleware');

//Function for Arduino
router.post('/', verifyDeviceToken, async(req, res) => {
    try {
        //getting timecards where there is no clockOut
        const missedClockouts = await Timecard.find({ clockOut: null, clockIn: { $lt: new Date().setHours(0, 0, 0, 0) } });

        if (missedClockouts.length > 0) {
            for (let timecard of missedClockouts) {
                //clockOut = clockIn so no hours are added
                timecard.clockOut = timecard.clockIn;
                timecard.status = 'Did not clock out';
                timecard.note = 'Automatically set clock-out to clock-in due to missed clock-out. No hours added.';

                await timecard.save();
                console.log(`Updated timecard for user ${timecard.userId}: Set clockOut to clockIn due to missed clock-out.`);
            }
            res.send({ message: `${missedClockouts.length} timecards updated.` });
        } else {
            res.send({ message: 'No missed clock-outs found.' });
        }
    } catch (error) {
        console.error('Error processing missed clock-outs:', error);
        res.status(500).send({ message: 'Error processing missed clock-outs.', error });
    }
});

module.exports = router;
