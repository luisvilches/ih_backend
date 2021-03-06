const Propiedades = require('../models/propiedades');
const Plantas = require('../models/plantas')
const Inspecciones = require('../models/inpecciones')
const User = require('../models/user');
const mongoose = require('mongoose')

exports.create = async (req, res) => {
    const { body } = req;
    let propiedad = new Propiedades({
        id_user: mongoose.Types.ObjectId(body.id_user),
        region: body.region,
        comuna: body.comuna,
        proyecto: body.proyecto,
        edificacion: body.edificacion,
        tipo: body.tipo,
        lote: body.lote,
        calle: body.calle,
        numero: body.numero,
        idPlanta: mongoose.Types.ObjectId(body.idPlanta),
        escritura: await req.tools.fileupload(req.files['escritura']),
        incripcion: await req.tools.fileupload(req.files['inscripcion']),
    })

    propiedad.save()
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => {
            console.log("###", err)
            res.status(500).json({ success: false, err: err })
        })
}

exports.remove = (req, res) => {
    Propiedades.deleteOne({ _id: req.params.id })
        .then(response => {
            Inspecciones.deleteMany({propiedad:mongoose.Types.ObjectId(req.params.id)})
            .then(ins => {
                res.status(200).json({ success: true, data: response })
            })
            .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.byId = (req, res) => {
    Propiedades.findById({ _id: req.params.id })
        .populate({ path: 'idPlanta', model: Plantas })
        .then(response => {res.status(200).json({ success: true, data: response })})
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.byUser = (req, res) => {

    Propiedades.aggregate([
        { $match: { id_user: mongoose.Types.ObjectId(req.params.id_user) } },
        {
            $lookup: {
                from: User.collection.name,
                localField: "_id",
                foreignField: "propiedad",
                as: "inspecciones"
            }
        },
        {
            $lookup: {
                from: Inspecciones.collection.name,
                localField: "_id",
                foreignField: "propiedad",
                as: "inspecciones"
            }
        },
        {
            $lookup: {
                from: Plantas.collection.name,
                localField: "idPlanta",
                foreignField: "_id",
                as: "planta"
            }
        },
        { "$unwind": "$planta" },
    ])
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.byClient = (req, res) => {
    Inspecciones.aggregate([
        {
            $lookup: {
                from: User.collection.name,
                localField: "client",
                foreignField: "_id",
                as: "cliente"
            }
        },
        {
            $lookup: {
                from: Propiedades.collection.name,
                localField: "propiedad",
                foreignField: "_id",
                as: "propiedades"
            }
        },
    ])
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}


exports.ddd = (req, res) => {
    User.aggregate([
        { $match: { client: true, id_inpect: mongoose.Types.ObjectId(req.params.id) } },
        {
            $lookup: {
                from: Inspecciones.collection.name,
                localField: "_id",
                foreignField: "client",
                as: "inspecciones"
            }
        },
        {
            $lookup: {
                from: Propiedades.collection.name,
                localField: "_id",
                foreignField: "id_user",
                as: "propiedades"
            },
        },
    ])
        .then(response => { res.status(200).json({ success: true, data: response }) })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })

    //  @respose
}

exports.changeStatus = (req, res) => {
    Propiedades.findById({ _id: req.params.id })
        .then(doc => {
            doc['estado'] = req.params.status
            doc.save()
                .then(response => res.status(200).json({ success: true, data: response }))
                .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
        })
        .catch(err => console.log(err))
}

exports.entrega = (req, res) => {
    let s = new Date();
    Propiedades.findById({ _id: req.params.id })
        .then(doc => {
            doc['estado'] = 'entregada';
            doc['fecha_entrega'] = parseDate(s);
            doc.save()
                .then(response => {
                    Inspecciones.findById({ _id: mongoose.Types.ObjectId(response.inspeccion_actual) })
                        .then(ins => {
                            if (ins == null) {
                                res.status(200).json({ success: false, err: 'Sin inspeccion en curso' })
                            } else {
                                ins['estado'] = 'entregada';
                                ins.save()
                                    .then(result => {
                                        res.status(200).json({ success: true, data: response })
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        { console.log(err); res.status(500).json({ success: false, err: err }) }
                                    })
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            { console.log(err); res.status(500).json({ success: false, err: err }) }
                        })
                })
                .catch(err => {
                    console.log(err);
                    { console.log(err); res.status(500).json({ success: false, err: err }) }
                })
        })
        .catch(err => {
            console.log(err);
            { console.log(err); res.status(500).json({ success: false, err: err }) }
        })
}

function parseDate(date) {
    const dateTimeFormat = new Intl.DateTimeFormat("es", {
        year: "numeric",
        month: "numeric",
        day: "2-digit",
    });

    date = new Date(date);

    return dateTimeFormat
        .formatToParts(date)
        .map((e) => e.value)
        .join("");
}

exports.propiedadesByInspector = (req, res) => {
    Propiedades.find({})
        .then(response => {
            const data = [];
            response.map(e => {
                e.inspecciones.map(insp => {
                    if (insp.id_inspector === req.params.id) data.push(e)
                });
            })

            res.status(200).json({ success: true, data: data })
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}


exports.updateEscritura = (req, res) => {
    Propiedades.findById({ _id: req.params.id })
        .then(async response => {
            response['escritura'] = await req.tools.fileupload(req.files['escritura']);
            response.save()
                .then(save => res.status(200).json({ success: true, data: save }))
                .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.updateInscripcion = (req, res) => {
    Propiedades.findById({ _id: req.params.id })
        .then(async response => {
            response['incripcion'] = await req.tools.fileupload(req.files['inscripcion']);
            response.save()
                .then(save => res.status(200).json({ success: true, data: save }))
                .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.setInscripcion = (req, res) => {
    Propiedades.findById({ _id: req.params.id })
        .then(response => {
            response['recepcion_municiapal'] = req.body.date;
            response.save()
                .then(doc => {
                    res.status(200).json({ success: true, data: response })
                })
                .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.propiedadesByClient = (req, res) => {
    Propiedades.find({ id_user: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, data: err }))
}


exports.propiedades = (req, res) => {
    User.aggregate([
        { $match: { client: true, id_inpect: mongoose.Types.ObjectId(req.params.id) } },
        {
            $lookup: {
                from: Propiedades.collection.name,
                localField: "_id",
                foreignField: "id_user",
                as: "propiedades"
            }
        },
    ])
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, data: err }))
}