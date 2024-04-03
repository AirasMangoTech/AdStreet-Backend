// const response = require("../utils/responseHelpers");

// module.exports.validation = (schema, returnBool = false, query = false) => async (req, res, next) => {
//   const body = query ? req.query : req.body;
//   try {
//     const d =  schema.validate(body);
//     if (d?.error) throw d
//     return returnBool ? true : next();
//   } catch (e) {
//     console.log(e)
//     return returnBool ? false : response.validationError(res, e.error?.details[0]?.message);
//   }
// };