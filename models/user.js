const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const User = new Schema({
    verification:{type:Boolean, default:false},
    name: { type: String },
    lastname: { type: String },
    rut: { type: String },
    email: { type: String },
    phone: { type: String },
    password: { type: String },
    role: { type: String },
    username: { type: String, default: "" },
    client: { type: Boolean, default: false },
    roleOptions:{},
    calendar:[
        {
            date:String,
            month:String,
            year:String,
            day:String,
            hours:[
                {
                    hour:String,
                    clientId:String,
                    client:Object,
                    propiedad:Object,
                    estado:String
                }
            ]
        }
    ],

});

User.plugin(timestamps);

module.exports = mongoose.model('User', User);
