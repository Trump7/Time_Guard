const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Timecard = require('../models/Timecard');
const { verifyDeviceToken } = require('../middleware/authMiddleware');


//Function for Arduino
router.post('/', verifyDeviceToken, async(req, res) => {
    const {rfid} = req.body;
    const user = await User.findOne({rfid});
    if(user){
        const timecard = await Timecard.findOne({userId: user._id, clockOut: null, status: 'Active'});
        if(timecard){
            timecard.clockOut = new Date();
            timecard.status = 'Completed';

            //Calculating total time
            const clockInTime = new Date(timecard.clockIn);
            const clockOutTime = new Date(timecard.clockOut);
            const hoursWorked = (clockOutTime - clockInTime) / 3600000;
            user.totalHours += hoursWorked;
            await user.save();

            await timecard.save();
            res.send(timecard);
            console.log(`User ${user.name} clocked out at ${timecard.clockOut}.`)
        }
        else{
            res.status(404).send('No active timecard found');
        }
    }
    else{
        res.status(404).send('User not found');
    }
});

module.exports = router;