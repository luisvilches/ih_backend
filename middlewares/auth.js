const jwt = require('jwt-simple');
const config = require('../conf.json');
const { setCurrentTenantId } = require('../middlewares/storage');

/**
 * Middleware para la autenticacion de usuarios
 */

exports.auth = (req,res,next) => {
    console.log("AUTH",req.headers.authorization)
    if (!req.headers.authorization) return res.status(403).send({message: 'Error de auntenticación'})

    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.decode(token,config.server.security);
    const tenantId = payload.user.tenantId.toString().split('-')[1];
    req.user = payload.user;
    req.tenantId = tenantId;
    setCurrentTenantId(tenantId);
    next();
}