const Plantas = require('../models/plantas')
const Proyectos = require('../models/proyectos')
const Edificaciones = require('../models/edificaciones')
const mongoose = require('mongoose');

exports.nuevo = async (req, res) => {
    const { body, files } = req;
    const edificacion = new Plantas({
        proyecto: mongoose.Types.ObjectId(body.proyecto),
        edificacion: mongoose.Types.ObjectId(body.edificacion),
        num_planta: body.num_planta,
        num_departamento: body.num_departamento,
        num_calle: body.num_calle,
        casa_tipo: body.casa_tipo,
        calle: body.calle,
        m2: body.m2,
        tipologia: body.tipologia,
        plano: await req.tools.fileupload(files.plano),
        habitaciones: JSON.parse(body.habitaciones)
    })

    edificacion.save()
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.findForm = (req, res) => {
    const { params } = req;
    console.log('@params', params);
    Plantas.find({ proyecto: mongoose.Types.ObjectId(params.proyecto), edificacion: mongoose.Types.ObjectId(params.edificacion) })
        .populate({ path: 'proyecto', model: Proyectos })
        .populate({ path: 'edificacion', model: Edificaciones })
        .then(response => {
            res.status(200).json({ success: true, data: response })
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.all = (req, res) => {
    Plantas.find({})
        .populate({ path: 'proyecto', model: Proyectos })
        .populate({ path: 'edificacion', model: Edificaciones })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.delete = (req, res) => {
    Plantas.deleteOne({ _id: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.findById = (req, res) => {
    Plantas.findById({ _id: req.params.id })
        .populate({ path: 'proyecto', model: Proyectos })
        .populate({ path: 'edificacion', model: Edificaciones })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.findByNameProject = (req, res) => {
    Plantas.find({ proyecto: req.params.project })
        .populate({ path: 'proyecto', model: Proyectos })
        .populate({ path: 'edificacion', model: Edificaciones })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.update = (req, res) => {
    const { body, files } = req;
    Plantas.findById({ _id: req.params.id })
        .then(async doc => {
            doc['proyecto'] = mongoose.Types.ObjectId(body.proyecto)
            doc['edificacion'] = mongoose.Types.ObjectId(body.edificacion),
                doc['num_planta'] = body.num_planta
            doc['num_departamento'] = body.num_departamento
            doc['num_calle'] = body.num_calle
            doc['calle'] = body.calle
            doc['casa_tipo'] = body.casa_tipo
            doc['m2'] = body.m2
            doc['tipologia'] = body.tipologia
            if (files.plano != null && files.plano != undefined) {
                doc['plano'] = await req.tools.fileupload(files.plano);
            }
            doc['habitaciones'] = JSON.parse(body.habitaciones)

            doc.save()
                .then(response => res.status(200).json({ success: true, data: response }))
                .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
        })
        .catch(err => { console.log(err); { console.log(err); res.status(500).json({ success: false, err: err }) } })
}