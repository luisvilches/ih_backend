const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const Propiedad = new Schema({
    id_user: { type: Schema.Types.ObjectId },
    region: { type: String },
    comuna: { type: String },
    proyecto: { type: String },
    edificacion: { type: String },
    tipo: { type: String },
    lote: { type: String },
    calle: { type: String },
    numero: { type: String },
    escritura: [],
    incripcion: [],
    estado: { type: String, default: 'init' },
    idPlanta: { type: Schema.Types.ObjectId, ref: 'Plantas' },
    recepcion_municiapal: { type: String, default: "-" },
    inspeccion_actual: { type: Schema.Types.ObjectId },
    fecha_entrega: { type: String, default: '' }
});

Propiedad.plugin(timestamps);

module.exports = mongoose.model('Propiedad', Propiedad);
