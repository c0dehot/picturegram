
const mongoose = require('mongoose');
const schema = mongoose.Schema;
 
let thumbnail = new schema ({
    name : String,
    image_url : String,
    tags : String,
    creation_time : {type: Date, default: Date.now},
    update_time : {type: Date , default: Date.now}
});

module.exports = mongoose.model('thumbnail', thumbnail);