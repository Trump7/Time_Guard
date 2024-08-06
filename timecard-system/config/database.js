const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        mongoose.connect(process.env.MONGODB_URI, 
        {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
            dbName: 'CardSystem',
        });
        console.log("MongoDB connected!");
    }
    catch(err){
        console.error(err);
        process.exit(1);
    }
};

module.exports = connectDB;