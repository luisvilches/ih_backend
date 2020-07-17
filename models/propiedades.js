const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const Propiedad = new Schema({
    id_user: { type: String },
    region: { type: String },
    comuna: { type: String },
    proyecto: { type: String },
    edificacion: { type: String },
    tipo: { type: String },
    lote: { type: String },
    calle: { type: String },
    numero: { type: String },
    escritura:[],
    incripcion:[]
});

Propiedad.plugin(timestamps);

module.exports = mongoose.model('Propiedad',Propiedad);
