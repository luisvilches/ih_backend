const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const autoIncrement = require('mongoose-auto-increment');
const Schema = mongoose.Schema;

const Inspecciones = new Schema({
    tipo:{type:String},
    date:{type:String},
    id_inspector:{type:Schema.Types.ObjectId},
    propiedad:{type:Schema.Types.ObjectId},
    client:{type:Schema.Types.ObjectId},
    estado:{type:String,default:"creada"},
    estadoCliente:{type:String},
    ficha_inspeccion:{type:Object, default:{url:""}},
    fecha_entrega: { type: String, default: '' }
});
autoIncrement.initialize(mongoose.connection);
Inspecciones.plugin(timestamps);
Inspecciones.plugin(autoIncrement.plugin, { model: 'Inspecciones', field: 'correlativo' });

module.exports = mongoose.model('Inspecciones', Inspecciones);