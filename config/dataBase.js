const mongoose = require('mongoose');
require('dotenv').config();

const dbConnect = () => {
    mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit the process with an error code
    });

    let db = mongoose.connection;
    db.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });
};

module.exports = { dbConnect };
