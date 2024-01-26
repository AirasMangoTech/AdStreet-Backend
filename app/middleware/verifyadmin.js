const response = require('../utils/responseHelpers');
const { ROLE_IDS } = require('../utils/utility');

const verifyAdmin = (req, res, next) => {
  // Logic to verify if the user is an admin
  if (req.user && req.user.id === ROLE_IDS.ADMIN) {
    return next(); // The user is admin, proceed to the next middleware
  } else {
    console.log(req.user);
    return response.forbidden(res, "Unauthorized: Admin access required");
  }
};

module.exports = { verifyAdmin };
