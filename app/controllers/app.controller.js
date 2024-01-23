const User = require("../models/users");
const Service = require("../models/roles");
const Query = require("../models/queries");
const NewQuery = require("../models/new_queries");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const response = require("../utils/responseHelpers");
const { ObjectId } = require("mongodb");
const logger = require("../logger");
const ISODate = require("isodate");
const fs = require("fs");
const moment = require("moment");
const { sendEmail } = require("../utils/sendEmail");
require("dotenv").config();

const getServices = async (req, res) => {
  try {
    const data = await Service.find({}).sort({ order: 1 });

    return response.success(res, "All Services", { services: data });
  } catch (error) {
    logger.error(`ip: ${req.ip},url: ${req.url},error:${error.stack}`, "error");
    return response.serverError(res, "Some Error Occurred - " + error.message);
  }
};

//Old
const getQueries = async (req, res) => {
  try {
    let page = 1;
    let limit = 10;
    if (req.query.page) {
      page = parseInt(req.query.page.toString());
    }
    if (req.query.limit) {
      limit = parseInt(req.query.limit.toString());
    }
    var skip = limit * page - limit;

    const query = {};

    if (req.query.search) {
      query.$or = [
        { "contact.name": { $regex: req.query.search, $options: "i" } },
        { "contact.number": { $regex: req.query.search, $options: "i" } },
        { "contact.email": { $regex: req.query.search, $options: "i" } },
      ];
    }

    if (req.query.from_date) {
      query.createdAt = {
        $gte: new Date(req.query.from_date),
      };
    }

    if (req.query.to_date) {
      query.createdAt = {
        ...query.createdAt,
        $lte: new Date(req.query.to_date),
      };
    }

    if (req.query.service_id) {
      query.service_id = req.query.service_id;
    }

    const data = await Query.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Query.countDocuments(query);

    return response.success(res, "All Queries", { queries: data, total });
  } catch (error) {
    logger.error(`ip: ${req.ip},url: ${req.url},error:${error.stack}`, "error");
    return response.serverError(res, "Some Error Occurred - " + error.message);
  }
};

//Old Method
const submitQuery = async (req, res) => {
  try {
    let query = new Query(req.body);
    query.payment.status = "pending";

    query.save();

    fs.readFile("./app/utils/userOrder.html", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading HTML file:", err);
        return;
      }

      // Replace placeholders with actual values
      const serviceName = query.summary.name;
      const clientName = query.contact.name;
      const clientEmail = query.contact.email;
      const totalPrice = query.payment.total;
      const clientPhone = query.contact.number;
      const clientAddress = query.contact.address;
      const serviceFrequency = query.frequency.type;
      const startDate =
        query.frequency.dates.length > 0
          ? query.frequency.dates[0]
          : "No starting Date Available";

      let hidden = "<style> .hidden2 {display: none} </style>";
      if (query.summary.pricing_type != "hour") {
        hidden = "<style> .hidden {display: none} </style>";
      }

      if (query.summary.pricing_type == "Contact us") {
        hidden = "<style> .hiddenMax {display: none} </style>";
      }

      let price = query.payment.total;
      let materialPrice = query.payment.material;
      let taxable = parseFloat(price) + parseFloat(materialPrice);
      let vat = parseFloat(taxable) * 0.05;
      let total = parseFloat(taxable) + parseFloat(vat);

      // Perform replacements in the HTML content
      const replacedHTML = data
        .replace(/{{clientCity}}/g, query.contact.city)
        .replace(/{{serviceName}}/g, serviceName)
        .replace(/{{clientName}}/g, clientName)
        .replace(/{{clientEmail}}/g, clientEmail)
        .replace(/{{totalPrice}}/g, totalPrice)
        .replace(/{{clientPhone}}/g, clientPhone)
        .replace(/{{clientAddress}}/g, clientAddress)
        .replace(/{{clientLatitude}}/g, query.contact.latitude)
        .replace(/{{clientLongitude}}/g, query.contact.longitude)
        .replace(/{{clientBuilding}}/g, query.contact.building)
        .replace(/{{clientFlat}}/g, query.contact.flat)
        .replace(/{{frequency}}/g, serviceFrequency)
        .replace(/{{sqft}}/g, query.summary.sqft)
        .replace(/{{startDate}}/g, startDate)
        .replace(/{{hours}}/g, query.summary.hours)
        .replace(
          /{{cleaningMaterial}}/g,
          query.summary.cleaning_material
            ? JSON.parse(query.summary.cleaning_material)
              ? "Yes"
              : "No"
            : "No"
        )
        .replace(
          /{{months}}/g,
          query.frequency.months ? query.frequency.months.join(",") : ""
        )
        .replace(
          /{{dates}}/g,
          query.frequency.dates ? query.frequency.dates.join(",") : ""
        )
        .replace(
          /{{days}}/g,
          query.frequency.days ? query.frequency.days.join(",") : ""
        )
        .replace(/{{timeSlot}}/g, query.frequency.slot[0] ?? "N/A")
        .replace(/{{weeks}}/g, query.frequency.weeks ?? "")
        .replace(/{{maids}}/g, query.summary.maids)
        .replace(/{{price}}/g, price)
        .replace(/{{materialPrice}}/g, materialPrice)
        .replace(/{{taxable}}/g, taxable)
        .replace(/{{vat}}/g, vat)
        .replace(/{{paymentMethod}}/g, query.payment.method)
        .replace(/{{notes}}/g, query.summary.notes)
        .replace(/{{conditionalStyle}}/g, hidden)
        .replace(/{{total}}/g, total);

      sendEmail(
        query.contact.email,
        "Thankyou for your submission - " + clientName,
        replacedHTML
      );
      sendEmail(
        "office.cocoprimecleaning@gmail.com",
        "New Submission Received - " + clientName,
        replacedHTML
      );
      //sendEmail("airas.mangotech@gmail.com", "New Submission Received", replacedHTML)
    });

    return response.success(res, "Request submitted successfully");
  } catch (error) {
    logger.error(`ip: ${req.ip},url: ${req.url},error:${error.stack}`, "error");
    return response.serverError(res, "Some Error Occurred - " + error.message);
  }
};

const getNewQueries = async (req, res) => {
  try {
    let page = 1;
    let limit = 10;
    if (req.query.page) {
      page = parseInt(req.query.page.toString());
    }
    if (req.query.limit) {
      limit = parseInt(req.query.limit.toString());
    }
    var skip = limit * page - limit;

    const query = {};

    if (req.query.search) {
      query.$or = [
        { "contact.name": { $regex: req.query.search, $options: "i" } },
        { "contact.number": { $regex: req.query.search, $options: "i" } },
        { "contact.email": { $regex: req.query.search, $options: "i" } },
      ];
    }

    if (req.query.from_date) {
        if (!query.createdAt) {
          query.createdAt = {};
        }
        query.createdAt.$gte = new Date(req.query.from_date);
      }
      
      if (req.query.to_date) {
        if (!query.createdAt) {
          query.createdAt = {};
        }
        query.createdAt.$lte = moment(req.query.to_date).endOf("day").toDate();
      }
      
    if (req.query.service_id) {
      query.service_id = req.query.service_id;
    }

    const data = await NewQuery.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .skip(skip);

    const total = await NewQuery.countDocuments(query);

    return response.success(res, "All Queries", { queries: data, total });
  } catch (error) {
    logger.error(`ip: ${req.ip},url: ${req.url},error:${error.stack}`, "error");
    return response.serverError(res, "Some Error Occurred - " + error.message);
  }
};

const queryDetails = async (req, res) => {
  try {
    let query = {};

    if (req.query.query_id) {
      query._id = req.query.query_id;
    }

    const data = await NewQuery.findOne(query);

    return response.success(res, "All Queries", { details: data });
  } catch (error) {
    logger.error(`ip: ${req.ip},url: ${req.url},error:${error.stack}`, "error");
    return response.serverError(res, "Some Error Occurred - " + error.message);
  }
};

//New Method
const submitNewQuery = async (req, res) => {
  try {
    let query = new NewQuery(req.body);
    query.payment.status = "pending";

    await query.save();

    fs.readFile("./app/utils/order.html", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading HTML file:", err);
        return;
      }

      // Replace placeholders with actual values
      const serviceName = query.summary.name;
      const clientName = query.contact.name;
      const clientEmail = query.contact.email;
      const totalPrice = query.payment.total;
      const clientPhone = "+971" + query.contact.number;
      const clientAddress = query.contact.address;

      let hidden = "<style> .hidden2 {display: none} </style>";
      if (query.summary.pricing_type != "hour") {
        hidden = "<style> .hidden {display: none} </style>";
      }

      if (query.summary.pricing_type == "Contact us") {
        hidden = "<style> .hiddenMax {display: none} </style>";
      }

      let price = query.payment.total;
      let materialPrice = query.payment.material;
      let taxable = parseFloat(price) + parseFloat(materialPrice);
      let vat = parseFloat(taxable) * 0.05;
      let total = parseFloat(taxable) + parseFloat(vat);

      // Perform replacements in the HTML content
      const replacedHTML = data
        .replace(/{{id}}/g, query._id)
        .replace(/{{clientCity}}/g, query.contact.city)
        .replace(/{{serviceName}}/g, serviceName)
        .replace(/{{clientName}}/g, clientName)
        .replace(/{{clientEmail}}/g, clientEmail)
        .replace(/{{totalPrice}}/g, totalPrice)
        .replace(/{{clientPhone}}/g, clientPhone)
        .replace(/{{clientAddress}}/g, clientAddress)
        .replace(/{{clientLatitude}}/g, query.contact.latitude)
        .replace(/{{clientLongitude}}/g, query.contact.longitude)
        .replace(/{{clientBuilding}}/g, query.contact.building)
        .replace(/{{clientFlat}}/g, query.contact.flat)
        .replace(/{{sqft}}/g, query.summary.sqft)
        .replace(/{{hours}}/g, query.summary.hours)
        .replace(/{{notes}}/g, query.summary.notes)
        .replace(
          /{{cleaningMaterial}}/g,
          query.summary.cleaning_material
            ? JSON.parse(query.summary.cleaning_material)
              ? "Yes"
              : "No"
            : "No"
        )
        .replace(/{{price}}/g, req.body.price)
        .replace(/{{materialPrice}}/g, req.body.material_price)
        .replace(/{{taxable}}/g, req.body.taxable)
        .replace(/{{vat}}/g, req.body.vat)
        .replace(/{{paymentMethod}}/g, query.payment.method)
        .replace(/{{conditionalStyle}}/g, hidden)
        .replace(/{{grandTotal}}/g, req.body.grand_total)
        .replace(/{{dates}}/g, moment(query.createdAt).format("DD MMM YYYY"));

      sendEmail(
        query.contact.email,
        "Thankyou for your submission - " + clientName,
        replacedHTML
      );
      //sendEmail("office.cocoprimecleaning@gmail.com", "New Submission Received - "+clientName, replacedHTML)
      sendEmail(
        "aqsaahmedmangotech@gmail.com",
        "New Submission Received From " + clientName,
        replacedHTML
      );
    });

    return response.success(res, "Request submitted successfully");
  } catch (error) {
    logger.error(`ip: ${req.ip},url: ${req.url},error:${error.stack}`, "error");
    return response.serverError(res, "Some Error Occurred - " + error.message);
  }
};

module.exports = {
  getServices,
  getQueries,
  submitQuery,
  submitNewQuery,
  getNewQueries,
  queryDetails,
};
