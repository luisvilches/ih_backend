const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const Edificacion = new Schema({
    edificacion: { type: String },
    name: { type: String },
    region: { type: String },
    comuna: { type: String },
    direccion: { type: String },
    proyecto: { type: String },
    lote: { type: String },
    company: { type: String },
    docs: [
        {
            name: { type: String },
            url: { type: String }
        }
    ],
    others: [
        {
            name: { type: String },
            url: { type: String }
        }
    ]
});

Edificacion.plugin(timestamps);

module.exports = mongoose.model('Edificacion', Edificacion);
