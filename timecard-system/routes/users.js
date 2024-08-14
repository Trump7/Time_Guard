const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Account = require('../models/Account');
const Timecard = require('../models/Timecard');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//add a new user
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

//get all current users
router.get('/', async (req, res) => {
    try {
      const users = await User.find();
      res.send(users);
    } catch (error) {
      console.log('Error fetching users:', error);
      res.status(500).send(error);
    }
});

//get all history entries
router.get('/history', async (req, res) => {
    try {
      const history = await Timecard.find();
      res.send(history);
    } catch (error) {
      console.log('Error fetching history entries:', error);
      res.status(500).send(error);
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

// Login Route
router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await Account.findOne({ username });
      if (!user) return res.status(400).send('User not found');
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).send('Invalid credentials');
  
      const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({token});
    } catch (err) {
      res.status(500).send('Error logging in user');
    }
  });

module.exports = router;