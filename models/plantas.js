const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const Planta = new Schema({
    proyecto: { type: Schema.Types.ObjectId, ref:'Proyectos' },
    edificacion: { type: Schema.Types.ObjectId, ref:'Edificaciones' },
    num_planta: { type: String },
    num_departamento: { type: String },
    num_calle: { type: String },
    calle: { type: String },
    casa_tipo: { type: String },
    m2: { type: String },
    tipologia: { type: String },
    plano: {},
    habitaciones: [],
});

Planta.plugin(timestamps);

module.exports = mongoose.model('Planta', Planta);