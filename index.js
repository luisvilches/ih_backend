require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const server = require('http').createServer(app)
// const io = require('socket.io').listen(server, { origins: '*:*' })
const formidable = require('formidable')
const mongoose = require('mongoose')
const path = require('path')
const utils = require('./utils');
const { auth } = require('./middlewares/auth');
const settings = require('./settings');
const { env } = require('process')
const { db } = settings;
exports.settings = settings;

// promesa formidable
const promiseForm = (req) => {
    const form = formidable({ multiples: true });
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ body: fields, files: files });
        });
    });
}

// middleware formidable
async function middleFiles(req, res, next) {
    const result = await promiseForm(req);
    req['files'] = result.files;
    req['body'] = result.body;
    next();
}

app.use(cors());
app.use(utils);
app.use(middleFiles)
app.use(express.static(path.join(path.resolve(), 'public')));
app.use('/', require('./routes/public'));
app.use('/api', auth, require('./routes/private'));

// CONEXION DB
mongoose.connect(db, { autoIndex: false }, err => {
    if (err) console.log(err);
    else console.log('open db');
})

// SERVER
server.listen(process.env.PORT || 12001, err => err ? console.log(err) : console.log("server running in port " + 12001));