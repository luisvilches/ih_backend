const User = require('../models/user')
const Propiedades = require('../models/propiedades')

exports.nuevo = (req, res) => {
    const { body } = req;
    const user = new User({
        name: body.name,
        lastname: body.lastname,
        rut: body.rut,
        email: body.email,
        phone: body.phone,
        password: body.password,
        role: 'user'
    })

    user.save()
        .then(async response => {
            const prop = JSON.parse(body.propiedades);
            var i = 0;
            while (i < prop.length) {
                let propiedad = new Propiedades({
                    id_user: response._id,
                    region: prop[i].region,
                    comuna: prop[i].comuna,
                    proyecto: prop[i].proyecto,
                    edificacion: prop[i].edificacion,
                    tipo: prop[i].tipo,
                    lote: prop[i].lote,
                    calle: prop[i].calle,
                    numero: prop[i].numero,
                    escritura: await req.tools.fileupload(req.files['escritura'+i]),
                    incripcion: await req.tools.fileupload(req.files['inscripcion'+i]),
                })


                propiedad.save()
                    .then(prod => console.log(prod))
                    .catch(err => res.status(500).json({ success: false, err: err }))

                i++;
            }

            res.status(200).json({ success: true, data: response })
        })
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.all = (req, res) => {
    User.find({})
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.delete = (req, res) => {
    User.remove({ _id: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.findById = (req, res) => {
    User.findById({ _id: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => res.status(500).json({ success: false, err: err }))
}

exports.update = (req, res) => {
    const { body } = req;
    User.findById({ _id: req.params.id })
        .then(doc => {
            doc = {
                name: body.name,
                lastname: body.lastname,
                run: body.run,
                email: body.email,
                phone: body.phone,
                password: body.password,
                role: body.role
            }

            doc.save()
                .then(response => res.status(200).json({ success: true, data: response }))
                .catch(err => res.status(500).json({ success: false, err: err }))
        })
        .catch(err => res.status(500).json({ success: false, err: err }))
}