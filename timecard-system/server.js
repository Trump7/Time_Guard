require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const config = require('../config.json');

const app = express();
const PORT = process.env.PORT || 3000;

//connect to mongo
connectDB();

//middleware
app.use(cors({
    origin: `http://${config.BASE_IP}`,
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use('/api/users', require('./routes/users'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/clockin', require('./routes/clockin'));
app.use('/api/clockout', require('./routes/clockout'));
app.use('/api/quickbooks', require('./routes/quickbooks'));
app.use('/api/checkmissedclockouts', require('./routes/checkmissedclockouts'));

app.get('/', (req, res) => {
    res.send('Server is running...');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});