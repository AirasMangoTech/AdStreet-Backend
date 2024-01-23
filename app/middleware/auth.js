const jwt = require("jsonwebtoken");
const logger = require("../logger");
const response  = require("../utils/responseHelpers");
const config = process.env;
const verifyToken = (req, res, next) => {
    var token = req.headers['authorization']; 
    if (!token) {
        return response.authError(res,"Authorization Token is required for further processing")
    }
     // Remove Bearer from string
    token = token.replace(/^Bearer\s+/, "");
    try {
        const decoded = jwt.verify(token, config.SECRET_KEY);
        req.user = decoded;
        
    } catch (error) {
        logger.error(`ip: ${req.ip},url: ${req.url},error:${error.stack}`,'error')
        return response.authError(res, "Unauthorized")
    }
    return next();
}

module.exports = verifyToken;