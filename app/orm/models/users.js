const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let users = new Schema ({
    firstName:     { type: String, trim: true },
    lastName:      { type: String, trim: true },
    emailAddress:  { type: String, required: true, trim: true, match: [/.+@.+\..+/, 'Please enter a valid e-mail address'] },
    userPassword:  { type: String, required: true, trim: true },
    imageFavourites: [ { type: Schema.Types.ObjectId, ref: 'images' } ]
}, {
    timestamps: true /* creates corresponding timestamp fields: createdAt, updatedAt */
});

module.exports = mongoose.model('users', users);