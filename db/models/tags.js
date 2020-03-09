const mongoose = require('mongoose');
const schema = mongoose.Schema;
 
let tags = new schema({
    tag_name: String,
    pictures_id: [String]
});


module.exports = mongoose.model('tags', tags);