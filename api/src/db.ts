import mongoose = require('mongoose');


const connectDB = () => {
    mongoose.connect('mongodb://localhost:27017/vuets', {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
    // we're connected!
        console.log('db connected')
    });
}

export default connectDB
