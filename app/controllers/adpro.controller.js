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
      category,
      timeline,
      budget,
      details,
      links,
      file,
    } = req.body;
    const newRegistrationAdpro = new RegistrationAdpro({
      name,
      industry,
      phoneNumber,
      email,
      companyName,
      service,
      category,
      budget,
      timeline,
      details,
      links,
      file:req.body.file,
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

const getAdpros = async (req, res) => {
  try {
    // Fetch adpros from the database
    const adpros = await RegistrationAdpro.find();

    // Check if adpros are found
    if (!adpros || adpros.length === 0) {
      return response.notFound(res, "No adpros found");
    }

    // Return adpros in the response
    return response.success(res, "Adpros fetched successfully", { adpros });
  } catch (error) {
    console.log(error);
    return response.serverError(res, "Error in fetching adpros", error.message);
  }
};

module.exports = {
  adproRegister,
  getAdpros,
};
