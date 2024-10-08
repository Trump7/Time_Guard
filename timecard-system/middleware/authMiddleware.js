const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
require('dotenv').config();


// Middleware to verify admin JWT token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;  // Store the verified payload (usually contains user ID)
        next();
    } catch (error) {
        res.status(400).send('Invalid Token');
    }
};

// Middleware to check admin role
const checkAdmin = async (req, res, next) => {
    try {
        const admin = await Account.findById(req.user.id);
        if (admin) {
            next();
        } else {
            res.status(403).send('Access Denied: Admins Only');
        }
    } catch (error) {
        console.error('Admin Check Failed:', error);
        res.status(400).send('Invalid Request');
    }
};

// Middleware to verify device token
const verifyDeviceToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access Denied: No Token Provided');

    if (token === process.env.DEVICE_TOKEN) {
        next();
    } else {
        res.status(401).send('Access Denied: Invalid Device Token');
    }
};

module.exports = {verifyToken, checkAdmin, verifyDeviceToken};