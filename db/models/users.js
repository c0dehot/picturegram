const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let users = new Schema ({
   firstName : String,
   lastName : String,
   emailAddress : String,
   userPassword : String,
   creationTime : {type: Date, default: Date.now},
   updateTime : {type: Date, default: Date.now},
   favorites: [{thumbId:Number, favoriteTime: {type: Date, default: Date.now}}]
});

module.exports = mongoose.model('users', users);