const NodeMailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const smtp = require('./smpt')
const template = require('../ templatesEmails');
const heml = require('heml');

exports.userActive = function (body) {

    return new Promise((resolve, reject) => {

        heml(template.activeUser())
            .then(({html,metadata,errors}) => {

                if (errors) {
                    console.log(errors)
                };

                let mailOptions = {
                    from: 'no-reply@inspectorhogar.cl <no-reply@inspectorhogar.cl>',
                    to: [body.mail],
                    subject: 'Credenciales de usuario IH',
                    html: html
                };

                let transporter = NodeMailer.createTransport(smtpTransport(smtp));

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(true);
                    }
                })
            })

    })
}


exports.userReject = function (body) {

    return new Promise((resolve, reject) => {

        heml(template.rejectUser())
            .then(({html,metadata,errors}) => {

                if (errors) {
                    console.log(errors)
                };

                let mailOptions = {
                    from: 'no-reply@inspectorhogar.cl <no-reply@inspectorhogar.cl>',
                    to: [body.mail],
                    subject: 'Credenciales de usuario IH',
                    html: html
                };

                let transporter = NodeMailer.createTransport(smtpTransport(smtp));

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(true);
                    }
                })
            })

    })
}
