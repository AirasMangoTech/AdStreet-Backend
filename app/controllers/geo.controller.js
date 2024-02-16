const Country = require("../models/countries");
const State = require("../models/states");
const City = require("../models/cities");
const response = require("../utils/responseHelpers");
const { ObjectId } = require("mongodb");
const logger = require("../logger");
require("dotenv").config();

const countries = async (req, res) => {
  try {
    const countries = await Country.aggregate([
      {
        $project: {
          _id: 1,
          name: 1,
          country_id: 1,
        },
      },
    ]);
    //const countries = await Country.find().select("_id country iso phone country_id");
    return response.success(res, "Countries List", { countries: countries });
  } catch (error) {
    logger.error(
      `ip: ${req.ip},url: ${req.url},error:${JSON.stringify(error.stack)}`
    );
    return response.serverError(res, "Some Error Is Occurred");
  }
};

const states = async (req, res) => {
  try {
    const states = await State.find({ country_id: req.params.id }).select(
      "_id state_id name"
    );
    return response.success(res, "States List", { states: states });
  } catch (error) {
    logger.error(
      `ip: ${req.ip},url: ${req.url},error:${JSON.stringify(error.stack)}`
    );
    return response.serverError(res, "Some Error Is Occurred");
  }
};

const cities = async (req, res) => {
  try {
    const cities = await City.find({ state_id: req.params.id }).select(
      "_id city_id name"
    );
    return response.success(res, "Cities List", { cities: cities });
  } catch (error) {
    logger.error(
      `ip: ${req.ip},url: ${req.url},error:${JSON.stringify(error.stack)}`
    );
    return response.serverError(res, "Some Error Is Occurred");
  }
};

module.exports = {
  countries,
  states,
  cities,
};
