const mongoose = require( 'mongoose' );

const MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost:27017/${process.env.DB_NAME}`

mongoose.connect(MONGODB_URI,
    {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});

module.exports = mongoose;
