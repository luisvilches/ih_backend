require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
// const server = require('http').createServer(app)
// const io = require('socket.io').listen(server, { origins: '*:*' })
const formidable = require('formidable')
const mongoose = require('mongoose')
const path = require('path')
const utils = require('./utils');
const { auth } = require('./middlewares/auth');
const settings = require('./settings');
const { db } = settings;
exports.settings = settings;

var allowlist = ['http://167.99.168.155', 'http://121.0.0.1','http://localhost:8080','http://localhost:8081']

var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use(cors(corsOptionsDelegate));


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

app.use(middleFiles)
app.use(express.static(path.join(path.resolve(), 'public')));

app.use('/', require('./routes/public'));
app.use('/api', auth, require('./routes/private'));

// CONEXION DB
// mongoose.connect('mongodb://inspector:inspector2020@ds155961.mlab.com:55961/inspector_hogar', err => {
mongoose.connect(db,{ autoIndex: false }, err => {
    if (err) console.log(err);
    else console.log('open db');
})

// SERVER
app.listen(12001, err => err ? console.log(err) : console.log("server running in port " + 12001));

// export socket.io
exports.io = io;
