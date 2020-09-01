const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
var { uniqueValid } = require('../utils/pluginsMongoose');
const { schema } = require('./propiedades');
const Schema = mongoose.Schema;

const User = new Schema({
    verification: { type: Boolean, default: false },
    name: { type: String },
    lastname: { type: String },
    rut: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    phone: { type: String },
    password: { type: String },
    role: { type: String },
    username: { type: String, required: true, unique: true },
    client: { type: Boolean, default: false },
    roleOptions: {},
    id_inpect: { type: Schema.Types.ObjectId },
    calendar: [
        {
            date: String,
            month: String,
            year: String,
            day: String,
            hours: [
                {
                    hour: String,
                    clientId: String,
                    client: Object,
                    propiedad: Object,
                    estado: String
                }
            ]
        }
    ],

});

User.plugin(timestamps);
// User.plugin(uniqueValid,{default:"ya existe"});

module.exports = mongoose.model('User', User);