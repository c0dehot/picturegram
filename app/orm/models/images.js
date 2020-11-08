
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let images = new Schema ({
    user:       { type: Schema.Types.ObjectId, required: true, ref: 'users' },
    title:      { type: String, required: true, trim: true },
    imageUrl:   { type: String, required: true, trim: true },
    tags:       [ String ]
}, {
    timestamps: true /* creates corresponding timestamp fields: createdAt, updatedAt */
});

module.exports = mongoose.model('images', images);