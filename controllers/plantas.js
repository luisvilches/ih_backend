const Plantas = require('../models/plantas')

exports.nuevo = async (req, res) => {
    const { body, files } = req;
    const edificacion = new Plantas({
        proyecto: body.proyecto,
        idProyecto: body.idProyecto,
        edificio: body.edificio,
        idedificio: body.idedificio,
        num_planta: body.num_planta,
        num_departamento: body.num_departamento,
        num_calle: body.num_calle,
        casa_tipo: body.casa_tipo,
        m2: body.m2,
        tipologia: body.tipologia,
        plano: await req.tools.fileupload(files.plano),
        habitaciones: JSON.parse(body.habitaciones),
        elementos: JSON.parse(body.elementos),
        tipos_de_elementos: JSON.parse(body.tipos_de_elementos),
        preguntas: JSON.parse(body.preguntas)
    })

    edificacion.save()
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.all = (req, res) => {
    Plantas.find({})
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.delete = (req, res) => {
    Plantas.remove({ _id: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.findById = (req, res) => {
    Plantas.findById({ _id: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.findByNameProject = (req, res) => {
    Plantas.find({ proyecto: req.params.project })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.update = (req, res) => {
    const { body, files } = req;
    Plantas.findById({ _id: req.params.id })
        .then(async doc => {
            doc['proyecto'] = body.proyecto
            doc['idProyecto'] = body.idProyecto
            doc['edificio'] = body.edificio
            doc['idedificio'] = body.idedificio
            doc['num_planta'] = body.num_planta
            doc['num_departamento'] = body.num_departamento
            doc['num_calle'] = body.num_calle
            doc['casa_tipo'] = body.casa_tipo
            doc['m2'] = body.m2
            doc['tipologia'] = body.tipologia
            // doc['plano'] = JSON.parse(body.old_docs).concat(await req.tools.fileupload(files.docs));
            doc['habitaciones'] = JSON.parse(body.habitaciones)
            doc['elementos'] = JSON.parse(body.elementos)
            doc['tipos_de_elementos'] = JSON.parse(body.tipos_de_elementos)
            doc['preguntas'] = JSON.parse(body.preguntas)

            doc.save()
                .then(response => res.status(200).json({ success: true, data: response }))
                .catch(err => res.status(500).json({ success: false, err: err }))
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}