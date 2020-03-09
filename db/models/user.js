const mongoose = require('mongoose');
const schema = mongoose.Schema;

let users = new schema ({
    first_name : String,
    last_name : String,
    email_address : String,
    user_password : String,
    creation_time : {type: Date, default: Date.now},
    update_time : {type: Date, default: Date.now},
    favorites: [{p_id:Number}]
})

module.exports = mongoose.model('users', users);