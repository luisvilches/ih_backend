const express = require('express')
const app = express()
const cors = require('cors')
const server = require('http').createServer(app)
const io = require('socket.io').listen(server,{ origins: '*:*'})
const formidable = require('formidable')
const mongoose = require('mongoose')
const path = require('path')
const utils = require('./utils');
const { env } = require('process')
const auth = require('./middlewares/auth');

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

app.use(utils);
app.use(cors());
app.use(middleFiles)
app.use(express.static(path.join(path.resolve(), 'public')));

app.use('/', require('./routes/public'));
app.use('/api', auth, require('./routes/private'));

// CONEXION DB
mongoose.connect('mongodb://inspector:inspector2020@ds155961.mlab.com:55961/inspector_hogar', err => {
    if(err) console.log(err);
    else console.log('open db');
})

// SERVER
server.listen(process.env.PORT || 5000, err => err ? console.log(err) : console.log("server running in port " + 12001));

// export socket.io
exports.io = io;
