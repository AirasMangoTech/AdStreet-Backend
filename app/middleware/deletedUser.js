const User = require("../models/users");
const response = require("../utils/responseHelpers");

module.exports = async (req, res, next) => {
  if (req.body?.email) {
    const user = await User.findOne({ email: req.body?.email });
    if (user?.isDelete) {
      return response.badRequest(
        res,
        "Your account has been deleted. Contact support for further inquiry."
      );
    }
    return next();
  } else {
    let user = await User.findOne({
      [`socialLogin.${req.body?.socialType}.id`]: req.body?.id,
    });

    if (user?.isDelete) {
      return response.badRequest(
        res,
        "Your account has been deleted. Contact support for further inquiry."
      );
    }
    next();
  }
};
