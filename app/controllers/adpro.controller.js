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
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items per page
    const skipIndex = (page - 1) * limit;
    const adpros = await RegistrationAdpro.find()
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(limit);
    const totalAdpros = await RegistrationAdpro.countDocuments();
    const totalPages = Math.ceil(totalAdpros / limit);
    

    // Check if adpros are found
    if (!adpros || adpros.length === 0) {
      return response.notFound(res, "No adpros found");
    }

    // Return adpros in the response
    return response.success(res, "Adpros fetched successfully", { adpros, totalPages, totalAdpros});
  } catch (error) {
    console.log(error);
    return response.serverError(res, "Error in fetching adpros", error.message);
  }
};

module.exports = {
  adproRegister,
  getAdpros,
};
