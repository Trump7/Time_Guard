const express = require('express');
const router = express.Router();
const Timecard = require('../models/Timecard');
const { verifyDeviceToken } = require('../middleware/authMiddleware');

//Function for Arduino
router.post('/', verifyDeviceToken, async(req, res) => {
    console.log(`[${new Date().toLocaleString('sv-SE').replace(' ', 'T')}] Incoming post request to checkmissedclockouts/`);

    try {
        //getting timecards where there is no clockOut time and it's not a manual add
        const missedClockouts = await Timecard.find({ clockOut: null, status: "Active" });

        if (missedClockouts.length > 0) {
            for (let timecard of missedClockouts) {
                //clockOut = clockIn so no hours are added
                timecard.clockOut = timecard.clockIn;
                timecard.status = 'Did not clock out';
                
                console.log(`User ${timecard.userId} did not clock out. Clockin Time: ${timecard.clockIn}`);
                await timecard.save();
            }
            console.log(`${missedClockouts.length} timecards updated.`);

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
