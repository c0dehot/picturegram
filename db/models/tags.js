const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tags = new Schema({
   tagName: String,
   picturesId: [String]
});


module.exports = mongoose.model('tags', tags);