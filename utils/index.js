const { uploadFile, multipleUploadFile } = require('./files');

const utils = (req,res,next) => {
    req['tools'] = {}
    req['tools']['fileupload'] = (files,folder) => {
        return multipleUploadFile(files,folder,req)
    }
    next();
}

module.exports = utils