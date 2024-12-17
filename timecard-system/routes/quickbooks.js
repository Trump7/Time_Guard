const express = require('express');
const router = express.Router();
const User = require('../models/User');

const { verifyDeviceToken } = require('../middleware/authMiddleware');
  
//This API is for the Python program
router.post('/', verifyDeviceToken, async(req, res) => {
    const {rfid} = req.body;
    try{
        const user = await User.findOne({rfid});
        if(user){
            //after finding the user, we need to return the username and pass for quickbooks
            
            console.log(`Found ${user.name}'s details for QuickBooks!`);
            res.status(200).json({username: user.username, password: user.password});
        }
        else{
            console.log(`RFID: ${rfid} not found in database`);
            res.status(404).send('User not found');
        }
    }
    catch(error){
        console.error(`Error Validating RFID: ${rfid} - `, error);
        res.status(400).send('Server Error');
    }
});


module.exports = router;