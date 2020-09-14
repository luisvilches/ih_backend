const User = require('../models/user')
const Propiedades = require('../models/propiedades')
const Inpeccion = require('../models/inpecciones');
const mongoose = require('mongoose');
const email = require('../utils/sendMail');


const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
]

exports.recovery = (req, res) => {
    const { body } = req;
    User.findOne({ email: body.email })
        .then(response => {
            if (response != null) {
                email.recovery({ mail: response.email }, { name: response['name'] + ' ' + response['lastname'], pass: response['password'] })
                    .then(send => {
                        if (send) {
                            res.status(200).json({ success: true, data: response })
                        } else {
                            res.status(500).json({ success: false, err: 'no se pudo enviar el correo' })
                        }
                    })
                    .catch(err => {
                        res.status(500).json({ success: false, err: err })
                    })
            } else {
                res.status(500).json({ success: false, err: 'no se pudo enviar el correo' })
            }
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.setPassword = (req, res) => {
    const { body } = req;
    User.findById({ _id: body.id })
        .then(response => {
            if (response.password === body.current) {
                User.findByIdAndUpdate({ _id: body.id }, { password: body.password })
                    .then(prod => res.status(200).json({ success: true, data: prod }))
                    .catch(err => { console.log(err), res.status(500).json({ success: false, err: err }) })
            } else {
                res.status(200).json({ success: false, data: 'Password actual es incorrecto' })
            }

        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ success: false, err: err })
        })
}

exports.client = async (req, res) => {
    const { body } = req;
    let date = new Date();

    if (Boolean(await User.countDocuments({ rut: body.rut })) || Boolean(await User.countDocuments({ email: body.email }))) {
        res.status(500).json({ success: false, err: { err: 'usuario ya existe' } })
    } else {
        const user = new User({
            name: body.name,
            lastname: body.lastname,
            rut: body.rut,
            email: body.email,
            phone: body.phone,
            password: body.password,
            username: body.name + body.lastname + date.getSeconds() + date.getMinutes() + date.getHours() + date.getDay() + date.getMonth() + date.getFullYear(),
            role: 'user',
            client: true,
            roleOptions: {},
            calendar: []
        })

        user.save()
            .then(async response => {
                const prop = JSON.parse(body.propiedades);
                var i = 0;
                while (i < prop.length) {
                    let propiedad = new Propiedades({
                        id_user: mongoose.Types.ObjectId(response._id),
                        region: prop[i].region,
                        comuna: prop[i].comuna,
                        proyecto: prop[i].proyecto,
                        edificacion: prop[i].edificacion,
                        tipo: prop[i].tipo,
                        lote: prop[i].lote,
                        calle: prop[i].calle,
                        numero: prop[i].numero,
                        idPlanta: prop[i].idPlanta,
                        escritura: await req.tools.fileupload(req.files['escritura' + i]),
                        incripcion: await req.tools.fileupload(req.files['inscripcion' + i]),
                    })

                    propiedad.save()
                        .then(prod => res.status(200).json({ success: true, data: response }))
                        .catch(err => {
                            console.log("###", err)
                            res.status(500).json({ success: false, err: err })
                        })

                    i++;
                }

                // res.status(200).json({ success: true, data: response })
            })
            .catch(err => {
                console.log("@@@", err)
                res.status(500).json({ success: false, err: err })
            })
    }

}


exports.rejectUsuario = (req, res) => {
    User.findByIdAndUpdate({ _id: req.params.id }, { verification: false })
        .then(user => {
            email.userReject({ mail: user.email })
                .then(send => {
                    if (send) {
                        res.status(200).json({ success: true, data: user })
                    }
                })
                .catch(err => {
                    console.log('··>', err)
                    res.status(500).json({ success: false, err: err })
                })
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.activarUsuario = (req, res) => {
    User.findByIdAndUpdate({ _id: req.params.id }, { verification: true })
        .then(user => {
            email.userActive({ mail: user.email })
                .then(send => {
                    if (send) {
                        res.status(200).json({ success: true, data: user })
                    }
                })
                .catch(err => {
                    console.log('··>', err)
                    res.status(500).json({ success: false, err: err })
                })
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.trabajador = (req, res) => {
    const { body } = req;
    const user = new User({
        name: body.name,
        lastname: body.lastname,
        rut: body.rut,
        email: body.email,
        phone: body.phone,
        password: body.password,
        username: body.username,
        role: body.job,
        roleOptions: {},
        calendar: [],
        verification: true
    })

    user.save()
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => {
            switch (err.code) {
                case 11000:
                    res.status(200).json({ success: false, err: err })
                default:
                    res.status(500).json({ success: false, err: err })
            }
        })
}

exports.all = (req, res) => {
    User.find({ client: true })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.allUserJob = (req, res) => {
    User.find({ client: false })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.delete = (req, res) => {
    User.remove({ _id: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.findById = (req, res) => {
    User.findById({ _id: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.update = (req, res) => {
    const { body } = req;
    User.findById({ _id: req.params.id })
        .then(doc => {
            doc['name'] = body.name
            doc['lastname'] = body.lastname
            doc['run'] = body.run
            doc['email'] = body.email
            doc['phone'] = body.phone
            doc['password'] = body.password

            doc.save()
                .then(response => res.status(200).json({ success: true, data: response }))
                .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}


exports.updateUserJob = (req, res) => {
    const { body } = req;
    User.findById({ _id: req.params.id })
        .then(doc => {
            doc['name'] = body.name
            doc['lastname'] = body.lastname
            doc['run'] = body.run
            doc['email'] = body.email
            doc['phone'] = body.phone
            doc['password'] = body.password
            doc['role'] = body.job
            doc['username'] = body.username

            doc.save()
                .then(response => res.status(200).json({ success: true, data: response }))
                .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.inspector = (req, res) => {
    const { body } = req;
    const user = new User({
        name: body.name,
        lastname: body.lastname,
        rut: body.rut,
        email: body.email,
        phone: body.phone,
        password: body.password,
        username: body.username,
        role: body.job,
        roleOptions: {},
        calendar: [],
        verification: true
    })

    user.save()
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}


exports.allUserinspector = (req, res) => {
    User.find({ client: false, role: "inspect" })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.delete = (req, res) => {
    User.remove({ _id: req.params.id })
        .then(response => res.status(200).json({ success: true, data: response }))
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}



exports.updateUserinspector = (req, res) => {
    const { body } = req;
    User.findById({ _id: req.params.id })
        .then(doc => {
            doc['name'] = body.name
            doc['lastname'] = body.lastname
            doc['run'] = body.run
            doc['email'] = body.email
            doc['phone'] = body.phone
            doc['password'] = body.password
            doc['role'] = body.job
            doc['username'] = body.username

            doc.save()
                .then(response => res.status(200).json({ success: true, data: response }))
                .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.asignar = (req, res) => {
    const { body } = req;

    const horas = JSON.parse(body.hours);
    const fechas = JSON.parse(body.dates);

    User.findById({ _id: body.idProfesional }, (err, data) => {
        fechas.forEach((date) => {
            var fechaSolicitada = date;
            let fecha = new Date(date);
            let dia = fecha.getDate();
            let mes = meses[fecha.getMonth()];
            let year = fecha.getFullYear();
            let hrs = [];
            horas.forEach((hora) => hrs.push({ hour: hora, disponible: true, clientId: null }));
            data.calendar.push(
                {
                    date: fechaSolicitada,
                    month: mes,
                    year: year,
                    day: dia,
                    hours: hrs
                }
            );
        });

        data.save((error, result) => {
            if (err) {
                console.log(err)
                res.status(500).json({ success: false, error: error });
            } else {
                res.status(200).json({ success: true, data: result });
            }
        });
    })
}

/**
 * Controlador que devuelve las horas disponible por cada profesional
 */

exports.libresByInspect = (req, res) => {
    User.findById({ _id: req.params.id }, (err, result) => {
        if (err) {
            console.log(err)
            res.status(500).json({ success: false, error: err });
        } else {
            var disponibles = [];
            var hrsDisponibles = [];
            result.calendar.map(hrs => {
                if (hrs.clientId == null) {
                    disponibles.push(hrs.date);
                    hrsDisponibles.push({ date: hrs.date, hrs: hrs.hours });
                }
            });
            res.status(200).json({ success: true, data: { fechas: disponibles, horas: hrsDisponibles, doc: result } });
        }
    })
}

exports.agendadas = (req, res) => {
    User.findById({ _id: req.params.id })
        .then(result => {
            const hours = [];
            let i = 0;
            while (i < result.calendar.length) {
                let o = 0;
                while (o < result.calendar[i].hours.length) {
                    if (result.calendar[i].hours[o].clientId != null) {
                        let a = {
                            hour: result.calendar[i].hours[o].hour,
                            date: result.calendar[i].date,
                            client: result.calendar[i].hours[o].client,
                            clientId: result.calendar[i].hours[o].clientId,
                            propiedad: result.calendar[i].hours[o].propiedad,
                            _id: result.calendar[i].hours[o]._id,
                        };
                        hours.push(a);
                    }
                    o++
                }
                i++;
            }

            res.status(200).json({ success: true, data: hours });
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}


exports.libres = (req, res) => {
    User.findById({ _id: req.params.id })
        .then(result => {
            var disponibles = [];
            var hrsDisponibles = [];
            result.calendar.map(hrs => {
                if (hrs.clientId == null) {
                    disponibles.push(hrs.date);
                    hrsDisponibles.push({ date: hrs.date, hrs: hrs.hours });
                }
            });
            res.status(200).json({ success: true, data: { fechas: disponibles, horas: hrsDisponibles, doc: result } });
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.libresAll = (req, res) => {
    User.find({})
        .then(response => {
            const disponibles = [];
            const hrsDisponibles = [];
            let i = 0;
            let c = 0;
            while (i < response.length) {
                let calendar = response[i].calendar;
                while (c < calendar.length) {
                    if (calendar[c].clientId == null) {
                        disponibles.push(calendar[c].date);
                        hrsDisponibles.push({ date: calendar[c].date, hrs: calendar[c].hours, inspector: response[i]._id });
                    }
                    c++
                }
                i++
            }

            res.status(200).json({ success: true, data: { fechas: disponibles, horas: hrsDisponibles, doc: response } });

        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, error: err }) })
}

function parseDate(date) {
    const dateTimeFormat = new Intl.DateTimeFormat("es", {
        year: "numeric",
        month: "numeric",
        day: "2-digit",
    });

    function isValidDate(date) {
        return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
    }

    date = new Date(date);

    return dateTimeFormat
        .formatToParts(date)
        .map((e) => e.value)
        .join("");
}

exports.libresBy = (req, res) => {
    User.findById({ _id: req.params.id })
        .then(result => {
            var disponibles = [];
            var hrsDisponibles = [];
            result.calendar.map(hrs => {
                if (parseDate(hrs.date) === parseDate(req.body.date)) {
                    if (hrs.clientId == null) {
                        disponibles.push(hrs.date);
                        hrsDisponibles.push({ date: hrs.date, hrs: hrs.hours });
                    }
                }
            });
            res.status(200).json({ success: true, data: { fechas: disponibles, horas: hrsDisponibles, doc: result } });
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}

exports.libresByDate = (req, res) => {
    User.find({})
        .then(response => {
            const hrsDisponibles = [];
            let i = 0;
            while (i < response.length) {
                let c = 0;
                let calendar = response[i].calendar;
                while (c < calendar.length) {
                    if (parseDate(calendar[c].date) === parseDate(req.body.date)) {
                        let o = 0;
                        let h = calendar[c].hours
                        while (o < h.length) {
                            if (h[o].clientId == null) {
                                hrsDisponibles.push({
                                    _id: h[o]._id,
                                    hour: h[o].hour,
                                    clientId: null,
                                    inspector: response[i]._id,
                                    date: calendar[c].date
                                });
                            }
                            o++;
                        }

                    }
                    c++
                }
                i++
            }

            res.status(200).json({ success: true, data: hrsDisponibles });

        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ success: false, error: err })
        })
}

/**
 * Controlador que agenda horas a un profesional
 */

// id: id_inspector
exports.agendar = (req, res) => {

    const { body } = req;
    User.findById({ _id: req.params.id }, (err, result) => {
        if (err) {
            console.log('@@@@@@@@@@', err);
            res.status(500).json({ success: false, error: err });
        } else {
            result.calendar.find((fecha) => {
                if (fecha.date.toString().toLowerCase().trim() === body.date.toString().toLowerCase().trim()) {
                    fecha.hours.find((fec) => {
                        if (fec.hour.toString().toLowerCase().trim() === body.hour.toString().toLowerCase().trim()) {
                            User.findById({ _id: body.IdClient, client: true }, (errPac, pac) => {
                                if (errPac) {
                                    console.log(errPac);
                                    res.status(500).json({ success: false, error: errPac });
                                } else {
                                    fec.clientId = pac._id;
                                    fec.client = pac;
                                    fec.estado = 'agendado';
                                    fec.propiedad = JSON.parse(body.propiedad);
                                    result.save((error, data) => {
                                        if (error) {
                                            console.log(error)
                                            res.status(500).json({ success: false, error: error });
                                        } else {
                                            const propiedad = JSON.parse(body.propiedad);
                                            Inpeccion.findById({ _id: propiedad.inspeccion_actual })
                                                .then(insp => {
                                                    insp['estado'] = 'agendada';
                                                    insp['date'] = body.date;
                                                    insp['id_inspector'] = mongoose.Types.ObjectId(result._id);
                                                    insp.save()
                                                        .then(aa => res.status(200).json({ success: true, data: data }))
                                                        .catch(err => { console.log(err); res.status(500).json({ success: false, error: err }) })
                                                })
                                                .catch(err => { console.log(err); res.status(500).json({ success: false, error: err }) })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            });
        }
    })
}

/**
 * Controlador que devuelve todas las proximas horas
 */

const isValidDate = obj => {
    return obj instanceof Date && !isNaN(obj.valueOf())
}


const proxima = (user, inspect) => {
    const proximas_horas = [];
    return new Promise((resolve, reject) => {
        User.find({ _id: inspect }, (err, response) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                let a = 0;
                while (a < response.length) {
                    let i = 0;
                    while (i < response[a].calendar.length) {
                        let o = 0;
                        while (o < response[a].calendar[i].hours.length) {
                            if (response[a].calendar[i].hours[o].clientId != null) {
                                let d = new Date(response[a].calendar[i].year + '-' + response[a].calendar[i].month + '-' + response[a].calendar[i].day);
                                let current = new Date();
                                if (response[a].calendar[i].hours[o].clientId === user) {
                                    if (isValidDate(d) && (d >= current)) {
                                        proximas_horas.push(
                                            {
                                                fecha: response[a].calendar[i].date,
                                                date: new Date(response[a].calendar[i].year + '-' + response[a].calendar[i].month + '-' + response[a].calendar[i].day),
                                                hora: response[a].calendar[i].hours[o].hour,
                                                paciente: response[a].calendar[i].hours[o].clientId,
                                            }
                                        );
                                    }
                                }
                            }
                            o++
                        }
                        i++
                    }
                    a++
                }

                resolve(proximas_horas)
            }
        })
    })
}


exports.asignInspect = (req, res) => {
    User.findById({ _id: req.params.id })
        .then(response => {
            response['id_inpect'] = mongoose.Types.ObjectId(req.params.inspect);
            response.save()
                .then(doc => res.status(200).json({ success: true, data: doc }))
                .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
        })
        .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
}


exports.dashboard = async (req, res) => {
    let props = await Propiedades.countDocuments({ id_user: req.params.id });
    let hrs = await proxima(req.params.id, req.params.inspect)
    let inspections = await Inpeccion.countDocuments({ client: mongoose.Types.ObjectId(req.params.id) })

    res.status(200).json({ success: true, data: { props, hrs: hrs.length > 0 ? hrs[1] : 0, inspections } })
}