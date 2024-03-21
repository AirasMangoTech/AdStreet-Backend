const RegistrationAdpro = require("../models/adpro");
const response = require("../utils/responseHelpers");
const adproRegister = async (req, res) => {
  try {
    const {
      name,
      industry,
      phoneNumber,
      email,
      companyName,
      service,
      timeline,
      budget,
      details,
      links,
      breifFile,
    } = req.body;
    const newRegistrationAdpro = new RegistrationAdpro({
      name,
      industry,
      phoneNumber,
      email,
      companyName,
      service,
      budget,
      timeline,
      details,
      links,
      breifFile,
    });
    await newRegistrationAdpro.save();

    return response.success(res, "Registration successful", {
      newRegistrationAdpro,
    });
  } catch (error) {
    console.log(error);
    return response.serverError(res, "Error in registration", error.message);
  }
};

module.exports = {
  adproRegister,
};
