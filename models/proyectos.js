const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const Proyecto = new Schema({
    name: { type: String },
    company: { type: String },
    region: { type: String },
    comuna: { type: String },
    direccion: { type: String },
    lote: { type: String }
});

Proyecto.plugin(timestamps);

module.exports = mongoose.model('Proyecto',Proyecto);
