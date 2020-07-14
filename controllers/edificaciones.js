const Edificaciones = require('../models/edificaciones')

exports.nuevo = (req, res) => {
    const { body, files } = req;
    const edificacion = new Edificaciones({
        edificacion: body.edificacion,
        name: body.name,
        region: body.region,
        comuna: body.comuna,
        direccion: body.direccion,
        lote: body.lote,
        company: body.company,
        docs: req.tools.fileupload(files.docs),
        others: req.tools.fileupload(files.others),
    })

    edificacion.save()
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.all = (req, res) => {
    Edificaciones.find({})
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.delete = (req, res) => {
    Edificaciones.remove({ _id: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.findById = (req, res) => {
    Edificaciones.findById({ _id: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.update = (req, res) => {
    const { body } = req;
    Edificaciones.findById({ _id: req.params.id })
        .then(doc => {
            doc = {
                edificacion: body.edificacion,
                name: body.name,
                region: body.region,
                comuna: body.comuna,
                direccion: body.direccion,
                lote: body.lote,
                company: body.company,
                docs: body.docs,
                others: body.others
            }

            doc.save()
                .then(response => res.status(200).json({ success: true, data: response }))
                .catch(err => res.status(500).json({ success: false, err: err }))
        })
        .catch(err => res.status(500).json({ success: false, err: err }))
}