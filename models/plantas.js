const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const Planta = new Schema({
    proyecto: { type: String },
    idProyecto: { type: String },
    edificio: { type: String },
    idedificio: { type: String },
    num_planta: { type: String },
    num_departamento: { type: String },
    num_calle: { type: String },
    casa_tipo: { type: String },
    m2: { type: String },
    tipologia: { type: String },
    plano: {},
    habitaciones: [],
    elementos: [],
    tipos_de_elementos: [],
    preguntas: []
});

Planta.plugin(timestamps);

module.exports = mongoose.model('Planta', Planta);
