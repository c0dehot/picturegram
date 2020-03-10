
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let thumbnail = new Schema ({
   name : String,
   imageUrl : String,
   tags : String,
   creationTime : {type: Date, default: Date.now},
   updateTime : {type: Date , default: Date.now}
});

module.exports = mongoose.model('thumbnail', thumbnail);