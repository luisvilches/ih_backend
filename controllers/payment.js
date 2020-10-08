const FlowApi = require("@piducancore/flowcl-node-api-client");
const Inpeccion = require('../models/inpecciones');
const Payments = require('../models/payments');
const Propiedades = require('../models/propiedades');
const User = require('../models/user');
const mongoose = require('mongoose')
const { site } = require('../settings');

const config = {
    "apiKey": "6716E8F4-3097-420C-B1FC-1LC5760380DB",
    "secretKey": "1a51ca81b8174e08ee3e1e9d63c8d3802f7984c7",
    "apiURL": "https://sandbox.flow.cl/api",
    "baseURL": site,
    "site": site
}

function getStatus(status) {
    switch (status) {
        case 1: return '/pendingpay';
        case 2: return '/pago-usuario';
        case 3: return '/err';
        case 4: return '/err';
    }
}


exports.confirm = async (req, res) => {
    try {
        let params = {
            token: req.body.token
        };
        let serviceName = "payment/getStatus";
        const flowApi = new FlowApi(config);
        let response = await flowApi.send(serviceName, params, "GET");

        Payments.findOne({ flowOrder: response.flowOrder })
            .then(async ress => {
                // let cliente = await Propiedades.findById({ _id: ress.idCliente });
                let propiedad = await Propiedades.findById({ _id: ress.idPropiedad })
                let inspeccion = new Inpeccion({
                    tipo: 'premium',
                    date: response.paymentData.date,
                    propiedad: propiedad,
                    client: mongoose.Types.ObjectId(ress.idCliente),
                    estado: "pagado"
                })

                inspeccion.save()
                    .then(doc => {
                        propiedad['estado'] = 'inspeccion';
                        propiedad['inspeccion_actual'] = mongoose.Types.ObjectId(doc._id);
                        propiedad.save()
                            .then(f => {
                                res.redirect(config.public_site + getStatus(response.status))
                            })
                            .catch(err => {console.log(err);res.status(500).json({ success: false, err: err })})
                    })
                    .catch(err => {console.log(err);res.status(500).json({ success: false, err: err })})

            })
            .catch(err => {console.log(err);res.status(500).json({ success: false, err: err })})
    } catch (error) {
        console.log(error);
        res.redirect(config.public_site + getStatus(2))
    }
}

exports.pay = async (req, res) => {
    const { body } = req;

    let params = {
        commerceOrder: Math.floor(Math.random() * (2000 - 1100 + 1)) + 1100,
        subject: "Inspector hogar premium",
        currency: "CLP",
        payment_currency: "CLP",
        paymentMethod: 9,
        amount: body.amount,
        email: body.email,
        urlConfirmation: config.baseURL + '/apiFlow/payment_confirm',
        urlReturn: config.baseURL + '/apiFlow/payment_confirm'
    }

    try {
        const flowApi = new FlowApi(config);
        let response = await flowApi.send("payment/create", params, "POST");

        let pay = new Payments({
            token: response.token,
            url: response.url,
            flowOrder: response.flowOrder,
            idCliente: body.client,
            idPropiedad: body.propiedad
        })

        pay.save()
            .then(dd => res.status(200).json({ success: true, data: response.url + "?token=" + response.token }))
            .catch(error => res.status(500).json({ success: false, err: error }))


    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, err: error })
    }
}