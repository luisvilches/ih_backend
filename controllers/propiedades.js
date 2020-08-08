const Propiedades = require('../models/propiedades');
const Inspecciones = require('../models/inpecciones')
const User = require('../models/user')

exports.byId = (req, res) => {
    Propiedades.findById({ _id: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.byUser = (req, res) => {


    Propiedades.aggregate([
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
        }
    ])
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, err: err }))
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
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.changeStatus = (req, res) => {
    Propiedades.findById({ _id: req.params.id })
        .then(doc => {
            doc['estado'] = req.params.status
            doc.save()
                .then(response => res.status(200).json({ success: true, data: response }))
                .catch(err => res.status(500).json({ success: false, err: err }))
        })
        .catch(err => console.log(err))
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
        .catch(err => res.status(500).json({ success: false, err: err }))
}