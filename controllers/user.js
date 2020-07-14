const User = require('../models/user')

exports.nuevo = (req, res) => {
    const { body } = req;
    const user = new User({
        name: body.name,
        lastname: body.lastname,
        run: body.run,
        email: body.email,
        phone: body.phone,
        password: body.password,
        role: body.role
    })

    user.save()
        .then(response => res.status(200).json({ success: true, data: response }))
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