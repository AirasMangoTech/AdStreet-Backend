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
      briefFile,
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
      file: briefFile,
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
    let query = {};
    if (req.query.category !== undefined) {
      const categories = req.query.category.split(",");
      const categoryObjectIDs = categories.map(
        (category) => new mongoose.Types.ObjectId(category)
      );
      query.category = { $in: categoryObjectIDs };
    }
    if (req.query.status) {
      query = { status: req.query.status };
    }
    const getStartOfDay = (date) => {
      return moment(date).startOf("day").toDate();
    };
    const getEndOfDay = (date) => {
      return moment(date).endOf("day").toDate();
    };
    if (req.query.created_at_from && req.query.created_at_to) {
      query.createdAt = {
        $gte: getStartOfDay(new Date(req.query.created_at_from)),
        $lte: getEndOfDay(new Date(req.query.created_at_to)),
      };
    } else if (req.query.created_at_from) {
      query.created_at = {
        $gte: getStartOfDay(new Date(req.query.created_at_from)),
      };
    } else if (req.query.created_at_to) {
      query.created_at = {
        $lte: getEndOfDay(new Date(req.query.created_at_to)),
      };
    }
    if(req.query.service){
      query.service = req.query.service;
    }
    if(req.query.industry){
      query.industry = req.query.industry;
    }
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items per page
    const skipIndex = (page - 1) * limit;
    const adpros = await RegistrationAdpro.find(query)
      .populate("service", "name")
      .populate("industry", "name")
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(limit);



    const totalAdpros = await RegistrationAdpro.countDocuments(query);
    const totalPages = Math.ceil(totalAdpros / limit);

    // Check if adpros are found
    if (!adpros || adpros.length === 0) {
      return response.notFound(res, "No adpros found");
    }

    // Return adpros in the response
    return response.success(res, "Adpros fetched successfully", {
      adpros,
      totalPages,
      totalAdpros,
    });
  } catch (error) {
    console.log(error);
    return response.serverError(res, "Error in fetching adpros", error.message);
  }
};

module.exports = {
  adproRegister,
  getAdpros,
};
