const Inpeccion = require('../models/inpecciones');
const Propiedades = require('../models/propiedades')
const User = require('../models/user')
const path = require('path')
const mongoose = require('mongoose');
const pdf = require('html-pdf');

exports.create = (req, res) => {
    const { body } = req;
    let inspeccion = new Inpeccion({
        tipo: body.tipo,
        date: body.date,
        hour: body.hour,
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

    Inpeccion.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(propiedad.inspeccion_actual) } },
        {
            $lookup: {
                from: User.collection.name,
                localField: "client",
                foreignField: "_id",
                as: "usuario"
            }
        },
        { "$unwind": "$usuario" },
        {
            $lookup: {
                from: Propiedades.collection.name,
                localField: "propiedad",
                foreignField: "_id",
                as: "propiedades"
            }
        },
        { "$unwind": "$propiedades" },
    ])
        .then(response => {
            let contenido = {
                propiedad: propiedad,
                habitaciones: habitaciones,
                date: dateParse(),
                ...response[0]
            }

            let options = {
                format: "A4",
                border: {
                    top: "15px",
                    right: "30px",
                    bottom: "15px",
                    left: "30px"
                },
                paginationOffset: 1,
                type: "pdf",
                quality: "100",
                footer: {
                    height: "10mm",
                    contents: {
                        default: `<div style="color: #9D9D9D;font-size: 9px;">Esta inspección es respaldada por Inspector Hogar - www.inspectorhogar.cl</div>`
                    }
                }
            }

            pdf.create(tmpPdf(contenido), options).toFile(path.join(path.resolve(), 'public', 'inspecciones', response[0]._id + '_' + '.pdf'), (err, result) => {
                if (err) {
                    { console.log(err); res.status(500).json({ success: false, err: err }) }
                } else {
                    Inpeccion.findById({ _id: response[0]._id })
                        .then(r => {
                            r['estado'] = 'reparacion';
                            r['ficha_inspeccion'] = 'http://' + req.headers.host + '/' + 'inspecciones/' + r._id + '_' + '.pdf'
                            r.save()
                                .then(async inp => {
                                    await changeStatusPropiedad(r.propiedad, "reparacion");
                                    res.status(200).json({ success: true, url: 'http://' + req.headers.host + '/' + 'inspecciones/' + r._id + '_' + '.pdf' })
                                })
                                .catch(err => { console.log(err); res.status(500).json({ success: false, err: err }) })
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
    return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap"
            rel="stylesheet">
        <style>
            body {
                width: 595px;
                font-family: 'Open Sans', sans-serif !important;
            }
    
            h1 {
                font-size: 15px;
                float: left;
                clear: both;
            }
    
            h2 {
                font-size: 13px;
                font-weight: 600;
                clear: both;
            }
    
            .br-green {
                height: 3px;
                background-color: #00A1BB;
                border: none;
                clear: both;
                margin: 10px 0;
            }
    
            .br-gray {
                height: 1px;
                background-color: #9D9D9D;
                border: none;
                clear: both;
                margin-top: 100px;
                display: block;
            }
    
            .br-gray-footer {
                height: 1px;
                background-color: #9D9D9D;
                border: none;
                clear: both;
                margin-top: 20px;
                display: block;
            }
    
            table {
                border-collapse: collapse;
                border-spacing: 0;
                table-layout: fixed;
                width: 260px;
            }
    
            table tr td,
            table tr th {
                font-size: 10px;
                vertical-align: top;
            }
    
            table tr th {
                font-weight: 600;
                width: 70px;
                text-align: left;
            }
    
            h4 {
                text-transform: uppercase;
                font-size: 10px;
                color: #00A1BB;
                clear: both;
            }
    
            h5 {
                text-transform: uppercase;
                font-size: 9px;
                line-height: 5px;
                clear: both;
            }
    
            p {
                font-size: 9px;
                line-height: 5px;
                font-weight: 600;
                clear: both;
            }
    
            span {
                font-size: 9px;
                line-height: 5px;
                clear: both;
                display:block;
            }

            img {
                max-height: 200px;
                margin: 10px 0;
                clear: both;
            }
        </style>
    </head>
    
    <body>
        <div>
            <h1>INFORME INSPECCIÓN <br>DE PROPIEDAD</h1>
            <svg style="float:right;margin-top:0px;margin-right:70px" width="50" height="50" viewBox="0 0 465 468" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0)">
                    <path d="M164.3 74.87H136.62V93.45H164.3V74.87Z" fill="#00A2BD" />
                    <path d="M123.21 74.87H95.53V93.45H123.21V74.87Z" fill="#00A2BD" />
                    <path d="M204.47 74.87H176.78V93.45H204.47V74.87Z" fill="#00A2BD" />
                    <path d="M164.3 105.93H136.62V124.51H164.3V105.93Z" fill="#00A2BD" />
                    <path d="M123.21 105.93H95.53V124.51H123.21V105.93Z" fill="#00A2BD" />
                    <path d="M204.47 105.93H176.78V124.51H204.47V105.93Z" fill="#00A2BD" />
                    <path d="M164.3 136.65H136.62V155.23H164.3V136.65Z" fill="#00A2BD" />
                    <path d="M123.21 136.65H95.53V155.23H123.21V136.65Z" fill="#00A2BD" />
                    <path d="M204.47 136.65H176.78V155.23H204.47V136.65Z" fill="#00A2BD" />
                    <path d="M164.3 165.85H136.62V184.43H164.3V165.85Z" fill="#00A2BD" />
                    <path d="M164.3 195.53H136.62V214.11H164.3V195.53Z" fill="#00A2BD" />
                    <path d="M123.21 165.85H95.53V184.43H123.21V165.85Z" fill="#00A2BD" />
                    <path d="M123.21 195.53H95.53V214.11H123.21V195.53Z" fill="#00A2BD" />
                    <path d="M123.21 224.54H95.53V243.12H123.21V224.54Z" fill="#00A2BD" />
                    <path d="M123.21 252.7H95.53V271.28H123.21V252.7Z" fill="#00A2BD" />
                    <path d="M204.47 165.85H176.78V184.43H204.47V165.85Z" fill="#00A2BD" />
                    <path
                        d="M457.68 377.95L322 256.58C318.15 253.14 315.28 253.29 312.55 255.24L308.4 251.53L305.4 254.89L298.17 248.42C314.702 222.524 323.468 192.433 323.43 161.71C323.43 72.54 250.89 0.0400085 161.72 0.0400085C72.55 0.0400085 0 72.54 0 161.71C0 250.88 72.54 323.43 161.72 323.43C182.954 323.447 203.982 319.27 223.597 311.137C243.212 303.004 261.028 291.077 276.02 276.04L281.85 281.25L278.85 284.6L283 288.32C281.37 291.25 281.54 294.11 285.39 297.56L421.06 418.89C424.686 422.226 429.488 423.985 434.411 423.781C439.333 423.576 443.973 421.425 447.31 417.8L459.54 404.15C462.766 400.428 464.382 395.578 464.033 390.665C463.684 385.752 461.399 381.179 457.68 377.95V377.95ZM85.68 66.45H215.68V225.14L203.09 214.14H204.23V195.53H176.54V209.09L160.81 224.18H136.63V242.76H141.4L134.54 249.32L134.62 308.97C124.663 307.14 114.919 304.299 105.54 300.49H123.2V281.9H95.54V295.98C92.2067 294.34 88.9733 292.587 85.84 290.72C86.0454 290.229 86.1508 289.702 86.15 289.17L85.68 66.45ZM142.68 310.22L142.6 252.72L182.84 214.11H190.94L234.21 252.04V292.65C222.265 299.292 209.461 304.256 196.16 307.4V282.04C196.16 281.775 196.055 281.52 195.867 281.333C195.68 281.145 195.425 281.04 195.16 281.04H181.04C180.775 281.04 180.52 281.145 180.333 281.333C180.145 281.52 180.04 281.775 180.04 282.04V310.31C173.962 311.052 167.844 311.426 161.72 311.43C155.344 311.432 148.975 311.028 142.65 310.22H142.68ZM242.24 287.9V248.43L223.66 232.15V58.45H77.66L78.13 285.86C57.7787 272.169 41.1039 253.686 29.5726 232.037C18.0413 210.389 12.0068 186.238 12 161.71C12 79.16 79.17 12.04 161.72 12.04C244.27 12.04 311.43 79.2 311.43 161.75C311.414 186.898 305.065 211.638 292.967 233.685C280.87 255.733 263.414 274.378 242.21 287.9H242.24Z"
                        fill="#00A2BD" />
                    <path d="M17.97 359.16V336.04H23.36V359.21L17.97 359.16Z" fill="#00A2BD" />
                    <path
                        d="M35.15 359.16V336.04H38.83L55.14 349.7C55.69 350.15 56.14 350.58 56.61 350.98C57.02 351.371 57.4073 351.785 57.77 352.22C57.6767 350.887 57.6167 349.967 57.59 349.46C57.59 348.92 57.59 348.46 57.59 348.21V336.04H62.43V359.21H58.75L41.75 344.9C41.34 344.53 40.99 344.21 40.68 343.9C40.3781 343.615 40.091 343.315 39.82 343C39.9 343.72 39.95 344.4 39.99 345C40.03 345.6 39.99 346.19 39.99 346.66V359.17L35.15 359.16Z"
                        fill="#00A2BD" />
                    <path
                        d="M94.28 340.04H79.12V345.04H93.54C95.8067 345.04 97.3367 345.43 98.13 346.21C98.93 346.98 99.33 348.42 99.33 350.52V353.7C99.33 355.813 98.93 357.253 98.13 358.02C97.34 358.79 95.81 359.18 93.54 359.18H79.25C76.98 359.18 75.45 358.79 74.66 358.02C73.87 357.25 73.46 355.81 73.46 353.7V353.04L78.22 352.04V354.78H94.59V349.5H80.15C77.9 349.5 76.38 349.11 75.59 348.34C74.8 347.57 74.41 346.12 74.41 344.02V341.45C74.41 339.35 74.8 337.91 75.59 337.14C76.38 336.37 77.9 335.97 80.15 335.97H93.3C95.48 335.97 96.98 336.35 97.8 337.09C98.62 337.83 99.04 339.16 99.04 341.09V341.57L94.28 342.69V340.04Z"
                        fill="#00A2BD" />
                    <path
                        d="M110.54 359.16V336.04H130.34C131.757 335.919 133.172 336.298 134.34 337.11C134.787 337.555 135.129 338.093 135.344 338.686C135.558 339.279 135.639 339.912 135.58 340.54V345.71C135.625 346.322 135.538 346.936 135.324 347.51C135.11 348.085 134.774 348.607 134.34 349.04C133.171 349.849 131.756 350.224 130.34 350.1H115.83V359.1L110.54 359.16ZM127.95 340.04H115.83V346.17H127.95C128.616 346.236 129.286 346.096 129.87 345.77C130.058 345.584 130.202 345.358 130.29 345.109C130.379 344.859 130.409 344.593 130.38 344.33V341.85C130.408 341.592 130.377 341.33 130.289 341.086C130.2 340.841 130.057 340.62 129.87 340.44C129.286 340.114 128.616 339.974 127.95 340.04Z"
                        fill="#00A2BD" />
                    <path
                        d="M143.89 359.16V336.04H167.6V339.99H149.28V345.16H159.97V349.04H149.28V354.78H167.82V359.14L143.89 359.16Z"
                        fill="#00A2BD" />
                    <path
                        d="M197.21 340.14H182.68V354.8H197.21V349.8L202.6 350.92V353.66C202.6 355.78 202.21 357.22 201.41 357.99C200.61 358.76 199.1 359.14 196.86 359.14H183.03C180.78 359.14 179.26 358.76 178.47 357.99C177.68 357.22 177.29 355.78 177.29 353.66V341.47C177.29 339.37 177.68 337.93 178.47 337.16C179.26 336.39 180.78 335.99 183.03 335.99H196.86C199.1 335.99 200.61 336.38 201.41 337.16C202.21 337.94 202.6 339.37 202.6 341.47V343.67L197.21 344.52V340.14Z"
                        fill="#00A2BD" />
                    <path d="M224.54 340.14V359.14H219.15V340.14H208.48V336.04H235.17V340.19L224.54 340.14Z"
                        fill="#00A2BD" />
                    <path
                        d="M241.29 341.47C241.29 339.37 241.68 337.93 242.47 337.16C243.26 336.39 244.78 335.99 247.03 335.99H264.08C266.333 335.99 267.853 336.38 268.64 337.16C269.43 337.93 269.83 339.37 269.83 341.47V353.68C269.83 355.8 269.43 357.24 268.64 358.01C267.85 358.78 266.33 359.16 264.08 359.16H247.03C244.78 359.16 243.26 358.78 242.47 358.01C241.68 357.24 241.29 355.8 241.29 353.68V341.47ZM246.68 354.8H264.46V340.14H246.68V354.8Z"
                        fill="#00A2BD" />
                    <path
                        d="M281.18 359.16V336.04H300.99C302.407 335.918 303.823 336.296 304.99 337.11C305.437 337.555 305.779 338.093 305.994 338.686C306.208 339.279 306.289 339.912 306.23 340.54V345.97C306.288 346.596 306.207 347.227 305.992 347.819C305.778 348.41 305.436 348.946 304.99 349.39C303.827 350.214 302.409 350.596 300.99 350.47H297.99L308.69 359.21H300.95L291.61 350.47H286.5V359.21L281.18 359.16ZM298.6 340.04H286.48V346.48H298.6C299.277 346.54 299.955 346.386 300.54 346.04C300.732 345.858 300.879 345.635 300.969 345.386C301.059 345.138 301.09 344.872 301.06 344.61V341.82C301.089 341.561 301.057 341.298 300.966 341.054C300.876 340.809 300.73 340.589 300.54 340.41C299.947 340.089 299.269 339.96 298.6 340.04V340.04Z"
                        fill="#00A2BD" />
                    <path
                        d="M22.98 365.22C23.6184 365.215 24.2515 365.337 24.8423 365.578C25.4331 365.82 25.9699 366.177 26.4213 366.629C26.8728 367.08 27.2298 367.617 27.4717 368.208C27.7135 368.799 27.8353 369.432 27.83 370.07V391.82C31.4288 389.166 35.6936 387.563 40.1495 387.189C44.6055 386.815 49.0778 387.685 53.0687 389.702C57.0595 391.719 60.4122 394.804 62.7535 398.614C65.0948 402.424 66.3329 406.808 66.33 411.28V440.45C66.3119 441.731 65.7951 442.954 64.8895 443.859C63.9838 444.765 62.7607 445.282 61.48 445.3H61.37C60.7239 445.31 60.0827 445.187 59.4859 444.939C58.8891 444.692 58.3494 444.324 57.9 443.86C57.4339 443.425 57.0648 442.896 56.8167 442.308C56.5686 441.721 56.447 441.088 56.46 440.45V411.28C56.5105 409.368 56.1776 407.466 55.481 405.685C54.7843 403.904 53.7379 402.281 52.4037 400.911C51.0694 399.541 49.4742 398.452 47.7123 397.708C45.9504 396.965 44.0574 396.582 42.145 396.582C40.2326 396.582 38.3396 396.965 36.5777 397.708C34.8158 398.452 33.2206 399.541 31.8863 400.911C30.552 402.281 29.5057 403.904 28.809 405.685C28.1124 407.466 27.7795 409.368 27.83 411.28V440.45C27.843 441.088 27.7214 441.721 27.4733 442.308C27.2252 442.896 26.8561 443.425 26.39 443.86C25.9497 444.32 25.4202 444.685 24.8338 444.932C24.2474 445.18 23.6165 445.305 22.98 445.3H22.82C22.1833 445.306 21.5521 445.182 20.9655 444.934C20.379 444.686 19.8495 444.321 19.41 443.86C18.9439 443.425 18.5748 442.896 18.3267 442.308C18.0786 441.721 17.957 441.088 17.97 440.45V370.04C17.9647 369.402 18.0865 368.769 18.3283 368.178C18.5702 367.587 18.9272 367.05 19.3786 366.599C19.8301 366.147 20.3668 365.79 20.9577 365.548C21.5485 365.307 22.1816 365.185 22.82 365.19L22.98 365.22Z"
                        fill="#00A2BD" />
                    <path
                        d="M170.19 457.35C172.65 457.33 175.082 456.821 177.344 455.85C179.605 454.88 181.65 453.469 183.36 451.7C185.275 449.99 186.807 447.895 187.855 445.551C188.903 443.207 189.443 440.668 189.44 438.1V438.04C184.465 442.406 178.145 444.939 171.532 445.218C164.918 445.497 158.408 443.505 153.083 439.572C147.758 435.64 143.939 430.004 142.259 423.601C140.58 417.198 141.142 410.413 143.851 404.373C146.561 398.334 151.255 393.403 157.155 390.4C163.054 387.397 169.803 386.502 176.281 387.865C182.759 389.228 188.575 392.766 192.764 397.891C196.954 403.016 199.263 409.421 199.31 416.04V438.04C199.31 445.9 196.253 452.763 190.14 458.63C184.227 464.31 177.56 467.153 170.14 467.16C158.733 467.16 150.203 462.75 144.55 453.93C144.149 453.312 143.894 452.612 143.802 451.882C143.711 451.151 143.785 450.41 144.021 449.712C144.257 449.015 144.647 448.38 145.163 447.855C145.679 447.33 146.307 446.928 147 446.68L147.16 446.63C148.181 446.19 149.329 446.142 150.383 446.497C151.436 446.851 152.322 447.582 152.87 448.55C156.743 454.417 162.517 457.35 170.19 457.35ZM189.44 415.87C189.341 410.825 187.271 406.02 183.673 402.482C180.075 398.944 175.236 396.955 170.19 396.94C166.377 396.936 162.649 398.063 159.477 400.179C156.305 402.295 153.832 405.305 152.371 408.826C150.91 412.348 150.526 416.225 151.269 419.964C152.012 423.704 153.848 427.14 156.544 429.836C159.24 432.532 162.676 434.368 166.416 435.111C170.155 435.854 174.032 435.47 177.554 434.009C181.075 432.548 184.085 430.075 186.201 426.903C188.317 423.731 189.444 420.003 189.44 416.19V415.87Z"
                        fill="#00A2BD" />
                    <path
                        d="M259.66 395.61C262.414 398.275 264.592 401.476 266.061 405.016C267.53 408.555 268.258 412.358 268.2 416.19V440.45C268.213 441.088 268.091 441.721 267.843 442.308C267.595 442.896 267.226 443.425 266.76 443.86C266.319 444.321 265.787 444.687 265.199 444.934C264.611 445.182 263.978 445.306 263.34 445.3H263.18C262.543 445.305 261.913 445.18 261.326 444.932C260.74 444.685 260.21 444.32 259.77 443.86C259.304 443.425 258.935 442.896 258.687 442.308C258.439 441.721 258.317 441.088 258.33 440.45V438.04C254.072 441.797 248.808 444.226 243.186 445.028C237.565 445.83 231.831 444.97 226.693 442.554C221.554 440.137 217.235 436.27 214.267 431.428C211.299 426.587 209.813 420.983 209.991 415.308C210.169 409.632 212.004 404.132 215.269 399.486C218.534 394.841 223.088 391.252 228.368 389.162C233.648 387.072 239.424 386.573 244.984 387.726C250.544 388.879 255.646 391.633 259.66 395.65V395.61ZM225.43 402.61C222.731 405.305 220.893 408.741 220.147 412.481C219.401 416.222 219.782 420.1 221.24 423.624C222.699 427.148 225.17 430.161 228.341 432.28C231.512 434.4 235.241 435.531 239.055 435.531C242.869 435.531 246.598 434.4 249.769 432.28C252.94 430.161 255.411 427.148 256.87 423.624C258.328 420.1 258.709 416.222 257.963 412.481C257.217 408.741 255.379 405.305 252.68 402.61C250.923 400.784 248.808 399.341 246.469 398.368C244.129 397.396 241.613 396.917 239.08 396.96C236.541 396.919 234.021 397.397 231.673 398.365C229.326 399.333 227.201 400.771 225.43 402.59V402.61Z"
                        fill="#00A2BD" />
                    <path
                        d="M303.81 387.04C304.456 387.03 305.097 387.153 305.694 387.401C306.291 387.648 306.831 388.016 307.28 388.48C307.729 388.936 308.084 389.476 308.322 390.07C308.561 390.664 308.679 391.3 308.67 391.94V392.05C308.683 392.683 308.566 393.312 308.327 393.898C308.088 394.485 307.732 395.016 307.28 395.46C306.831 395.924 306.291 396.292 305.694 396.539C305.097 396.787 304.456 396.91 303.81 396.9H300.81C299.223 396.875 297.648 397.174 296.182 397.779C294.715 398.385 293.387 399.283 292.28 400.42C291.156 401.537 290.266 402.866 289.662 404.331C289.058 405.795 288.751 407.366 288.76 408.95V440.41C288.773 441.048 288.651 441.681 288.403 442.268C288.155 442.856 287.786 443.385 287.32 443.82C286.88 444.281 286.351 444.646 285.764 444.894C285.178 445.142 284.547 445.266 283.91 445.26H283.75C283.113 445.265 282.483 445.14 281.896 444.892C281.31 444.645 280.78 444.28 280.34 443.82C279.874 443.385 279.505 442.856 279.257 442.268C279.009 441.681 278.887 441.048 278.9 440.41V409.04C278.881 406.159 279.437 403.303 280.536 400.639C281.635 397.976 283.254 395.559 285.3 393.53C287.31 391.459 289.724 389.823 292.392 388.722C295.059 387.621 297.924 387.079 300.81 387.13L303.81 387.04Z"
                        fill="#00A2BD" />
                    <path
                        d="M123.99 405.63C123.37 406.63 122.76 407.63 122.16 408.57C123.23 411.023 123.772 413.674 123.75 416.35C123.739 420.659 122.282 424.839 119.613 428.222C116.944 431.605 113.217 433.994 109.03 435.008C104.842 436.022 100.435 435.602 96.5143 433.814C92.5937 432.027 89.3862 428.975 87.4052 425.149C85.4242 421.323 84.7842 416.942 85.5877 412.709C86.3912 408.476 88.5917 404.634 91.837 401.8C95.0823 398.966 99.1847 397.302 103.488 397.075C107.79 396.849 112.045 398.072 115.57 400.55C117.51 397.96 119.57 395.28 121.74 392.7C115.861 388.396 108.578 386.463 101.339 387.284C94.0997 388.106 87.4349 391.622 82.6702 397.134C77.9054 402.645 75.3898 409.748 75.6237 417.03C75.8577 424.312 78.824 431.239 83.9327 436.434C89.0413 441.628 95.9181 444.71 103.195 445.065C110.472 445.42 117.616 443.023 123.206 438.351C128.797 433.678 132.423 427.073 133.365 419.848C134.307 412.624 132.495 405.309 128.29 399.36C126.71 401.56 125.24 403.69 123.99 405.63Z"
                        fill="#00A2BD" />
                    <path
                        d="M108.65 431.04C108.725 431.032 108.797 431.004 108.857 430.958C108.917 430.912 108.963 430.85 108.99 430.78C110.93 426.12 116.12 414.26 122.36 404.58C130.12 392.58 145.94 373.75 146.83 372.68C146.869 372.627 146.902 372.57 146.93 372.51C146.701 372.592 146.477 372.689 146.26 372.8C146.21 372.8 140.88 375.57 130.08 386.33C119.28 397.09 106.79 416.49 106.66 416.68L106.17 417.45L92.09 409.54L108.24 430.87C108.287 430.932 108.35 430.981 108.422 431.01C108.494 431.04 108.573 431.051 108.65 431.04V431.04Z"
                        fill="#00A2BD" />
                </g>
                <defs>
                    <clipPath id="clip0">
                        <rect width="464.07" height="467.22" fill="white" />
                    </clipPath>
                </defs>
            </svg>
            <div class="br-green"></div>
        </div>
        <div>
            <h2>PROPIETARIO</h2>
            <table>
                <tr>
                    <th>Nombre</th>
                    <td>${data.usuario.name} ${data.usuario.lastname}</td>
                </tr>
                <tr>
                    <th>RUN:</th>
                    <td>${data.usuario.rut}</td>
                </tr>
                <tr>
                    <th>Email:</th>
                    <td>${data.usuario.email}</td>
                </tr>
                <tr>
                    <th>Teléfono</th>
                    <td>${data.usuario.phone}</td>
                </tr>
            </table>
        </div>
        <div>
            <h2>PROPIEDAD</h2>
            <div style="float: left;">
                <table>
                    <tr>
                        <th>Región</th>
                        <td>${data.propiedades.region}</td>
                    </tr>
                    <tr>
                        <th>Comuna:</th>
                        <td>${data.propiedades.comuna}</td>
                    </tr>
                    <tr>
                        <th>Nombre proyecto:</th>
                        <td>${data.propiedades.proyecto}</td>
                    </tr>
                    <tr>
                        <th>Edificación</th>
                        <td>${data.propiedades.edificacion}</td>
                    </tr>
                    <tr>
                        <th>Tipo</th>
                        <td>${data.propiedades.tipo}</td>
                    </tr>
                </table>
            </div>
            <div style="float: right;">
                <table>
                    <tr>
                        <th>Lote:</th>
                        <td>${data.propiedades.lote}</td>
                    </tr>
                    <tr>
                        <th>Calle:</th>
                        <td>${data.propiedades.calle}</td>
                    </tr>
                    <tr>
                        <th>Numero:</th>
                        <td>${data.propiedades.numero}</td>
                    </tr>
                    <tr>
                        <th>Inspección</th>
                        <td>${data.correlativo}</td>
                    </tr>
                    <tr>
                        <th>Estado de la propiedad</th>
                        <td>${data.propiedades.estado}</td>
                    </tr>
                </table>
            </div>
            <br>
        </div>
        <div class="br-gray"></div>
        <div>
            <br>
            <h2>ÍTEMS PARA REPARACIÓN</h2>
        </div>
    
        ${data.habitaciones.map(hab => {
        return `${hab.elementos.map(elem => {
            return `${elem.materiales.map(mat => {
                return `${mat.preguntas.map(pre => {
                    if (pre.success) {
                        return `<div style="margin:15px 0">
            <h4>${hab.habitacion == undefined ? '' : hab.habitacion}</h4>
            <h5>${elem.name == undefined ? '' : elem.name}</h5>
            <p>${pre.question == undefined ? '' : pre.question}</p>
            <span>${pre.response == undefined ? '' : pre.response}</span>
            ${pre.file != undefined ? `<img src="data:image/png;base64,${pre.file}" />` : ''}
        </div>`
                    }
                }).join('')}`
            }).join('')}`
        }).join('')}`
    }).join('')}
    </body>
    
    </html> `;
}






// <h5>${mat.name == undefined ? '' : mat.name}</h5>