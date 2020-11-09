const mongoose = require( 'mongoose' );

mongoose.connect(process.env.MONGO_URL ? process.env.MONGO_URL
    : `mongodb://localhost:27017/${process.env.DB_NAME}`,
{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

module.exports = mongoose;