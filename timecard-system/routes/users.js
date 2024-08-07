const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Timecard = require('../models/Timecard');

router.post('/', async(req, res) => {
    const user = new User(req.body);
    try{
        await user.save();
        res.send(user);
        console.log('A new user has been created!');
    }
    catch{
        console.log('User could not be created');
        res.status(400).send(error);
    }
});

router.post('/validate', async(req, res) => {
    const {rfid} = req.body;
    try{
        const user = await User.findOne({rfid});
        if(user){
            const activeEntry = await Timecard.findOne({userId: user._id, clockOut: null});
            console.log(`RFID: ${rfid} validated for user ${user.name}, clocked in: ${!!activeEntry}`);
            res.send({user, isClockedIn: !!activeEntry});
        }
        else{
            console.log(`RFID: ${rfid} not found in database`);
            res.status(404).send('User not found');
        }
    }
    catch(error){
        console.error(`Error Validating RFID: ${rfid}`);
        res.status(400).send(error);
    }
});

// Edit user
router.put('/:id', async(req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
        console.log(`User ${user.name} has been updated!`);
    } catch (error) {
        console.log('User could not be updated');
        res.status(400).send(error);
    }
});

// Delete user
router.delete('/:id', async(req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
        console.log(`User ${user.name} has been deleted!`);
    } catch (error) {
        console.log('User could not be deleted');
        res.status(400).send(error);
    }
});

// Fetch user by ID
router.get('/:id', async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
        console.log(`User ${user.name} has been fetched!`);
    } catch (error) {
        console.log('User could not be fetched');
        res.status(400).send(error);
    }
});

module.exports = router;