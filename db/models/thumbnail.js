
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let thumbnail = new Schema ({
   name :  { type: String, required: true, trim: true },
   imageUrl : { type: String, required: true, trim: true },
   tags :  { type: String, required: true, trim: true }
}, {
   timestamps: true /* creates corresponding timestamp fields: createdAt, updatedAt */
});

module.exports = mongoose.model('thumbnail', thumbnail);