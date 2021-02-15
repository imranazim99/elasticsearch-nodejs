const jwt = require('jsonwebtoken'),
      refreshToken = require('./refreshSecret');
      jwtConfig = require('./jwtConfig');

module.exports = async function checkJwtToken (req, res, next) {
 let authHeader = req.headers.authorization;
    if (authHeader && authHeader != undefined) {
         jwt.verify(authHeader, jwtConfig.secret, async (err, user) => {
            if (err) {
                if (err.name && err.name == 'TokenExpiredError') {
                     return res.send({ tokenExpired: "Token Expired" })
                }
            } else if (!user.aud) {
                     return res.send({ error: 'You are not Authorized' })
                //    return await res.render('http://localhost:9001/logout')
            } else {
                return next();
            }
        })
    } else {
        return await res.send({ unAuth: "Unauthorized User" });
    }
}
