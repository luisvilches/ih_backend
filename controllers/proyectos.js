const Proyecto = require('../models/proyectos')

exports.nuevo = (req, res) => {
    const { body } = req;
    const proyecto = new Proyecto({
        name: body.name,
        company: body.company,
        region: body.region,
        comuna: body.comuna,
        direccion: body.direccion,
        lote: body.lote
    })

    proyecto.save()
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.all = (req, res) => {
    Proyecto.find({})
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.delete = (req, res) => {
    Proyecto.deleteOne({ _id: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.findById = (req, res) => {
    Proyecto.findById({ _id: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.update = (req, res) => {
    const { body } = req;
    Proyecto.findById({ _id: req.params.id })
        .then(doc => {
            doc['name'] = body.name
            doc['company'] = body.company
            doc['region'] = body.region
            doc['comuna'] = body.comuna
            doc['direccion'] = body.direccion
            doc['lote'] = body.lote

            doc.save()
                .then(response => res.status(200).json({ success: true, data: response }))
                .catch(err => {
                    console.log(err)
                    res.status(500).json({ success: false, err: err })
                })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ success: false, err: err })
        })
}