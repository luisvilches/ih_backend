const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const Payments = new Schema({
    token: { type: String },
    url: { type: String },
    flowOrder: { type: String },
    idCliente: { type: String },
    idPropiedad: { type: String },
});

Payments.plugin(timestamps);

module.exports = mongoose.model('Payments',Payments);
