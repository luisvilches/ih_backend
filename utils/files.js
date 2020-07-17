const path = require('path');
const fs = require('fs');

function uploadFile(obj, name, folder, req) {

    let date = new Date();
    let nombre_nuevo = name + date.getDate() + date.getSeconds() + date.getMilliseconds() + "_file";
    let ruta_archivo = obj.path;
    let nueva_ruta = path.join(path.resolve(), 'public', folder ? folder : "", nombre_nuevo + path.extname(ruta_archivo).toLowerCase());//"."+ folder + nombre_nuevo + path.extname(ruta_archivo).toLowerCase();
    let nombre_imagen = nombre_nuevo + path.extname(ruta_archivo).toLowerCase();
    fs.createReadStream(ruta_archivo).pipe(fs.createWriteStream(nueva_ruta));
    return {
        name: nombre_imagen,
        url: req.headers.host + '/' + nombre_imagen
    };
}


const multipleUploadFile = (files, folder, req) => {
    return new Promise((resolve, reject) => {
        if (files != undefined) {
            if (Array.isArray(files)) {
                for (let i = 0; i < files.length; i++) {
                    let file = uploadFile(files[i], files[i].name, folder, req)
                    data.push(file);
                    console.log(file);
                    if (i == files.length - 1) resolve(data);
                }
            } else {
                let file = uploadFile(files, files.name, folder, req)
                resolve([file])
            }
        } else {
            resolve([]);
        }
    })
}

module.exports = { uploadFile, multipleUploadFile };