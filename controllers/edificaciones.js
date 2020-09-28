const Proyectos = require('../models/proyectos')
const Edificaciones = require('../models/edificaciones')
const mongoose = require('mongoose');

exports.nuevo = async (req, res) => {
    const { body, files } = req;
    const edificacion = new Edificaciones({
        edificacion: body.edificacion,
        name: body.name,
        proyecto: mongoose.Types.ObjectId(body.proyecto),
        pisos: body.pisos,
        viviendad: body.viviendas,
        docs: await req.tools.fileupload(files.docs),
        others: await req.tools.fileupload(files.others),
    })

    edificacion.save()
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => {
            console.log(err)
            res.status(500).json({ success: false, err: err })
        })
}

exports.all = (req, res) => {
    Edificaciones.find({})
        .populate({ path: 'proyecto', model: Proyectos })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => {
            console.log(err)
            res.status(500).json({ success: false, err: err })
        })
}

exports.delete = (req, res) => {
    Edificaciones.deleteOne({ _id: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.findById = (req, res) => {
    Edificaciones.findById({ _id: mongoose.Types.ObjectId(req.params.id) })
        .populate({ path: 'proyecto', model: Proyectos })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}
// .populate({ path: 'proyecto', model: Proyectos })
exports.findByNameProject = (req, res) => {
    Edificaciones.find({ proyecto: mongoose.Types.ObjectId(req.params.project) })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.update = (req, res) => {
    const { body, files } = req;
    Edificaciones.findById({ _id: req.params.id })
        .then(async doc => {
            doc['edificacion'] = body.edificacion
            doc['name'] = body.name
            doc['proyecto'] = mongoose.Types.ObjectId(body.proyecto)
            doc['pisos'] = body.pisos
            doc['viviendad'] = body.viviendas
            doc['docs'] = JSON.parse(body.old_docs).concat(await req.tools.fileupload(files.docs));
            doc['others'] = JSON.parse(body.old_others).concat(await req.tools.fileupload(files.others));

            doc.save()
                .then(response => res.status(200).json({ success: true, data: response }))
                .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}