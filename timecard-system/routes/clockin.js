const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Timecard = require('../models/Timecard');
const { verifyDeviceToken } = require('../middleware/authMiddleware');

//Function for Arduino
router.post('/', verifyDeviceToken, async(req, res) => {
    console.log(`[${new Date().toLocaleString('sv-SE').replace(' ', 'T')}] Incoming post request to clockin/`);

    const {rfid} = req.body;
    const user = await User.findOne({ rfid });
    if(user){
        const timecard = new Timecard({
            userId: user._id,
            clockIn: new Date()
        });
        await timecard.save();
        res.send(timecard);
        console.log(`User ${user.name} clocked in at ${timecard.clockIn.toLocaleString()}.`)
    }
    else{
        res.status(404).send('User not found');
    }
});

module.exports = router;