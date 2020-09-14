const template = require('../ templatesEmails');
const heml = require('heml');
const mailjet = require('node-mailjet').connect('ba3b929a19e13fa32599dcb8b1a4de38', '2b04d1c17ac23f87dc85f51fae9551dc')

const send = (email, name, Subject = "Inspector Hogar", template, id = Math.random().toString(36).slice(-8)) => {
    return new Promise((resolve, reject) => {
        const request = mailjet.post("send", { 'version': 'v3.1' }).request({
            "Messages": [
                {
                    "From": { "Email": "lvilches@socialventis.cl", "Name": "Inspector Hogar" },
                    "To": [{ "Email": email, "Name": name }],
                    "Subject": Subject,
                    "HTMLPart": template,
                    "CustomID": id
                }
            ]
        })
        request
            .then((result) => resolve(result))
            .catch((err) => reject(err))
    })
}

exports.userActive = function (body) {

    return new Promise((resolve, reject) => {

        heml(template.activeUser())
            .then(({ html, metadata, errors }) => {

                if (errors) console.log(errors)

                send(body.mail, '', 'Credenciales de usuario IH', html)
                    .then(e => resolve(e))
                    .catch(err => reject(err))
            })
    })
}

exports.userReject = function (body) {

    return new Promise((resolve, reject) => {

        heml(template.rejectUser())
            .then(({ html, metadata, errors }) => {

                if (errors) console.log(errors)

                send(body.mail, '', 'Credenciales de usuario IH', html)
                    .then(e => resolve(e))
                    .catch(err => reject(err))
            })

    })
}

exports.recovery = function (body,data) {

    return new Promise((resolve, reject) => {

        heml(template.recovery(data))
            .then(({ html, metadata, errors }) => {

                if (errors) console.log(errors)

                send(body.mail, '', 'Credenciales de usuario IH', html)
                    .then(e => resolve(e))
                    .catch(err => reject(err))
            })

    })
}

