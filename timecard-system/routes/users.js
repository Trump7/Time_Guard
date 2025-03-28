const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Account = require('../models/Account');
const Timecard = require('../models/Timecard');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, checkAdmin, verifyDeviceToken } = require('../middleware/authMiddleware');

//add a new user
router.post('/', verifyToken, checkAdmin, async(req, res) => {
    const {rfid, row} = req.body;
    let errorMessage = '';

    try{
        const rfidIs = await User.findOne({rfid});
        if(rfidIs){
            errorMessage += 'RFID number already exists. ';
        }
        const rowIs = await User.findOne({row});
        if(rowIs){
            errorMessage += 'Row number already exists. ';
        }

        if(errorMessage){
            return res.status(400).json({message: errorMessage.trim()});
        }

        const user = new User(req.body);
        await user.save();
        res.send(user);
        console.log(`${user.name} was successfully added.`);
    }
    catch(error){
        console.log('User could not be created', error);
        res.status(400).send({message: 'User could not be created', error});
    }
});

//get all current users
router.get('/', verifyToken, checkAdmin, async (req, res) => {
    try {
      const users = await User.find();
      res.send(users);
    } catch (error) {
      console.log('Error fetching users:', error);
      res.status(500).send(error);
    }
});

//get all employee names
router.get('/employees', async(req, res) => {
    try {
        const employees = await User.find().select('name');
        res.json(employees.map((e) => e.name));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees.'});
    }
});

//get a personalized history
router.get('/my-history', verifyToken, async(req, res) => {
    try{
        const userId = req.user.id;

        const entries = await Timecard.find({ userId }).sort({ clockIn: -1 });

        res.json(entries);
    } catch (error) {
        res.status(500).send(error);
    }
});

//get all history entries
router.get('/history', verifyToken, checkAdmin, async (req, res) => {
    try {
      const history = await Timecard.find();
      res.send(history);
    } catch (error) {
      console.log('Error fetching history entries:', error);
      res.status(500).send(error);
    }
});
  
//This API is for the Arduino Device
router.post('/validate', verifyDeviceToken, async(req, res) => {
    const {rfid} = req.body;
    try{
        const user = await User.findOne({rfid});
        if(user){
            const activeEntry = await Timecard.findOne({userId: user._id, clockOut: null, status: 'Active'});
            //console.log(`RFID: ${rfid} validated for user ${user.name}, clocked in: ${!!activeEntry}`);
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

// Reset user's times from Device
router.put('/reset-times', verifyDeviceToken, async(req, res) => {
    try {
        //go through each user and update their total hours to 0
        await User.updateMany({}, {totalHours: 0});
        console.log('All hours have been reset to 0.');
        res.status(200).send({message: 'All hours were reset to 0'});
    }
    catch(error){
        console.error('Error during resetting:', error);
        res.status(500).send({message: 'Reset of Hours failed to complete.'});
    }
});

//Edit user
router.put('/:id', verifyToken, checkAdmin, async (req, res) => {
    const { rfid, row } = req.body;
    let errorMessage = '';

    try {
        // Check if RFID number already exists and belongs to another user
        const rfidIs = await User.findOne({ rfid, _id: { $ne: req.params.id } });
        if (rfidIs) {
            errorMessage += 'RFID number already exists. ';
        }

        // Check if row number already exists and belongs to another user
        const rowIs = await User.findOne({ row, _id: { $ne: req.params.id } });
        if (rowIs) {
            errorMessage += 'Row number already exists.';
        }

        if (errorMessage) {
            return res.status(400).json({ message: errorMessage.trim() });
        }

        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
        console.log(`${user.name}'s details have been updated!`);
    } catch (error) {
        console.log('User could not be updated', error);
        res.status(400).send({ message: 'User could not be updated', error });
    }
});

// Delete user (Need to add to it...  Details like the history needs to be updated)
router.delete('/:id', verifyToken, checkAdmin, async(req, res) => {
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
router.get('/:id', verifyToken, checkAdmin, async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
        console.log(`${user.name} has been requested.`);
    } catch (error) {
        console.log('User could not be fetched');
        res.status(400).send(error);
    }
});

// User Login Route
router.post('/loginUser', async (req, res) => {
    try{
        // Taking in the full name and provided pass
        const { selectedEmployee, password } = req.body;

        // Trying to find account info by full name
        const user = await User.findOne({ name: selectedEmployee });

        // Shouldnt happen but worth a check
        if (!user) return res.status(400).send('User not found');

        //need to add bcrypt for future!!
        const isMatch = password === user.password;
        if (!isMatch) return res.status(400).send('Invalid credentials');

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({token, userName: user.name});

    } catch (error) {
        console.error('Error loggin in user: ', error);
        res.status(500).send('Error logging in user');
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Account.findOne({ username });
        if (!user) return res.status(400).send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid credentials');

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '1h' });

        //get current time
        const currentTime = new Date();
        
        //set prevLogin & newLogin to date & time
        user.prevLogin = user.newLogin;
        user.newLogin = currentTime;
        
        //send token to frontend, save newLogin & prevLogin
        await user.save();
        res.json({token, userName: user.username, prevLogin: user.prevLogin});
    } catch (err) {
        console.error('Error loggin in user: ', err);
        res.status(500).send('Error logging in user');
    }
});

module.exports = router;