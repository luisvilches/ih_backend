const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const User = new Schema({
    name: { type: String },
    company: { type: String },
    lastname: { type: String },
    run: { type: String },
    email: { type: String },
    phone: { type: String },
    password: { type: String },
    role: { type: String }
});

User.plugin(timestamps);

module.exports = mongoose.model('User',User);
