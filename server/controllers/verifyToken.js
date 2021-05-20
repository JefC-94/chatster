var jwt = require('jsonwebtoken');
var config = require('../config');

function verifyToken(req, res, next) {
  
    var token = req.headers['x-access-token'];
    
    if (!token) return res.json({success: 0, status: 401, message: 'No token provided'});
        
    jwt.verify(token, config.secret, async (err, decoded) => {
        if (err) return res.json({success: 0, status: 500, message: `JWT Verification failed: ${err}`});
        
        // if everything good, save to request for use in other routes
        // it seems that decoded.id is an array but sometimes not an array-> take first element or just pass element
        req.user_id = Array.isArray(decoded.id) ? decoded.id[0] : decoded.id;

        //console.log(req.user_id);
    
        next();
    });
}

module.exports = verifyToken;