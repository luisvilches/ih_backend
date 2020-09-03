const Inpeccion = require('../models/inpecciones');
const Propiedades = require('../models/propiedades')
const User = require('../models/user')
const path = require('path')
const mongoose = require('mongoose');
const pdf = require('html-pdf');

const options = {
    format: 'A4',
    header: { height: "50px" },
    footer: { height: "50px" },
};

exports.create = (req, res) => {
    const { body } = req;
    let inspeccion = new Inpeccion({
        tipo: body.tipo,
        date: body.date,
        propiedad: mongoose.Types.ObjectId(body.propiedad),
        client: mongoose.Types.ObjectId(body.client),
        estado: "pagado"
    })

    inspeccion.save()
        .then(response => {
            Propiedades.findById({ _id: body.propiedad })
                .then(ress => {
                    ress['inspeccion_actual'] = mongoose.Types.ObjectId(response._id);
                    ress.save()
                        .then(doc => res.status(200).json({ success: true, data: doc }))
                        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
                })
                .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })

        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.all = (req, res) => {
    Inpeccion.aggregate([
        {
            $lookup: {
                from: User.collection.name,
                localField: "client",
                foreignField: "_id",
                as: "usuario"
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
        .then(doc => res.status(200).json({ success: true, data: doc }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
    // Inpeccion.find()
    // .then(doc => res.status(200).json({ success: true, data: doc }))
    // .catch(err => {console.log(err);res.status(500).json({ success: false, err: err })})
}


exports.findById = (req, res) => {
    Inpeccion.findById({ _id: req.params.id })
        .then(doc => res.status(200).json({ success: true, data: doc }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

function changeStatusPropiedad(id, estado) {
    return new Promise((resolve, reject) => {
        Propiedades.findById({ _id: id })
            .then(doc => {
                doc['estado'] = estado
                doc.save()
                    .then(response => resolve(true))
                    .catch(err => reject(err))
            })
            .catch(err => console.log(err))
    })
}

exports.generatePdf = (req, res) => {
    const { body } = req;
    const propiedad = JSON.parse(body.propiedad)
    const habitaciones = JSON.parse(body.habitaciones)

    Inpeccion.findById({ _id: propiedad.inspeccion_actual })
        .then(response => {

            let contenido = {
                propiedad: propiedad,
                habitaciones: habitaciones,
                date: dateParse()
            }

            pdf.create(tmpPdf(contenido), options).toFile(path.join(path.resolve(), 'public', 'inspecciones', response._id + '_' + '.pdf'), (err, result) => {
                if (err) {
                    { console.log(err); res.status(500).json({ success: false, err: err }) }
                } else {
                    response['estado'] = 'reparacion';
                    response['ficha_inspeccion'] = 'http://' + req.headers.host + '/' + 'inspecciones/' + response._id + '_' + '.pdf'
                    response.save()
                        .then(async inp => {
                            await changeStatusPropiedad(response.propiedad, "reparacion");
                            res.status(200).json({ success: true, url: 'http://' + req.headers.host + '/' + 'inspecciones/' + response._id + '_' + '.pdf' })
                        })
                        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
                }
            })
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

function dateParse(date) {
    const dateTimeFormat = new Intl.DateTimeFormat("es", {
        year: "numeric",
        month: "numeric",
        day: "2-digit",
    });
    return dateTimeFormat
        .formatToParts(new Date())
        .map((e) => e.value)
        .join("");
}

function tmpPdf(data) {
    return `
    <!doctype html>
    <html>
        
        <head>
            <meta charset="utf-8">
            <title>Informe de inspeccion</title>
            <style>
                html,body{background-color: white;}
                body{display:flex}
                h1 {color: #222222;padding: 0;margin: 0;line-height: 10px}
                table {border-collapse: collapse;background-color: white;overflow: hidden;width: 520px;border-radius: 3px;}
                th,td {font-family: 'Motnserrat', sans-serif;text-align: left;font-size: 10px;padding: 5px;}
                th {background-color: #00a1bb;color: white;}
                .head {text-align: left;margin: 0;background: #222222;width: 520px;display: inline-block;font-size: 12px;position: relative;top: 2px;padding: 5px 0;}
                .head2 {text-align: left;margin: 0;background: #ccc;width: 520px;display: inline-block;font-size: 12px;position: relative;top: 2px;padding: 5px 0;}
                .head h4,.head2 h4 {margin: 0;color: white;position: relative;left: 6px;}
            </style>
        </head>
        
        <body>
        <div style="justify-content: center;padding:0 20px">
            <h1>Informe de inspeccion</h1>
            <div>
                <br>
                <h2>Informacion de la propiedad</h2>
                <div style="border-radius:15px;background:#eee;padding:20px 0px">
                    <div style="display:block">
                        <table style="justify-content: center;margin:0 auto;">
                            <thead>
                                <th align="left">Region</th>
                                <th align="left">Comuna</th>
                                <th align="left">Calle</th>
                                <th align="left">Numero</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="width: 30%;" align="left">${data.propiedad.region}</td>
                                    <td style="width: 30%;" align="left">${data.propiedad.comuna}</td>
                                    <td style="width: 30%;" align="left">${data.propiedad.calle}</td>
                                    <td style="width: 30%;" align="left">${data.propiedad.numero}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="height: 40px;"></div>
                    <div>
                        <table style="justify-content: center;margin:0 auto;">
                            <thead>
                                <th align="left">Proyecto</th>
                                <th align="left">Edificación</th>
                                <th align="left">Lote</th>
                                <th align="left">Fecha de inspección</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="width: 30%;" align="left">${data.propiedad.proyecto}</td>
                                    <td style="width: 30%;" align="left">${data.propiedad.edificacion}</td>
                                    <td style="width: 30%;" align="left">${data.propiedad.lote}</td>
                                    <td style="width: 30%;" align="left">${data.date}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <br>
                <h2>Detalle</h2>
                <hr>
                <div>
                    ${data.habitaciones.map(hab => {
        return `
                            <h3 style="margin:5px 0;">Habitacion: ${hab.habitacion}</h3>
                            ${hab.elementos.map(elem => {
            return `
                                    <div style="padding-left: 10px;">
                                        <div class="head">
                                            <h4>Elemento: ${elem.name}</h4>
                                        </div>
                                        ${elem.materiales.map(mat => {
                return `
                                                <div class="head2">
                                                    <h4>Elemento: ${mat.name}</h4>
                                                </div>
                                                <table>
                                                    <tr>
                                                        <th>Pregunta</th>
                                                        <th>Observacion</th>
                                                        <th>Imagen</th>
                                                    </tr>

                                                    ${mat.preguntas.map(pre => {
                    return `
                                                            ${pre.success ?
                            `<tr>
                                                                    <td>${pre.question}</td>
                                                                    <td>${pre.response}</td>
                                                                    <td>
                                                                        ${pre.file != undefined ? `
                                                                            <img style="width: 100px;"
                                                                            src="data:image/png;base64,${pre.file}"
                                                                            alt="">
                                                                        `: ``}
                                                                    </td>
                                                                </tr>`: ``}
                                                        `
                }).join('')}
                                                </table>
                                            `
            }).join('')}
                                    </div>
                                `
        }).join('')}
                            <hr>
                        `
    }).join('')}
                    
                </div>
            </div>
            </div>
        </body>
        
    </html>
    `;
}