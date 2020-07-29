const moment = require("moment");
const jwt = require("jwt-simple");

exports.createTokens = (user) => {
    let payload = {
        sub: user._id,
        iat: '',//moment().unix(),
        exp: '',//moment().add(14, 'days').unix(),
        user: user
    };

    return jwt.encode(payload, 'abcdefghijklmnopqrstu0987654321');
};