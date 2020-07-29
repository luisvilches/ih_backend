const jwt = require('jwt-simple');

/**
 * Middleware para la autenticacion de usuarios
 */

exports.auth = (req,res,next) => {
    console.log("AUTH",req.headers.authorization)
    if (!req.headers.authorization) return res.status(403).send({message: 'Error de auntenticación', success:false})
    const token = req.headers.authorization.split(" ")[1];
    if(token.split('.').length !== 3) return res.status(403).send({message: 'Error de auntenticación', success:false})
    const payload = jwt.decode(token,'abcdefghijklmnopqrstu0987654321');
    console.log(payload)
    req.user = payload.user;
    next();
}