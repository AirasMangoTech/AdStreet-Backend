const Account = require("../models/accounts");
const response = require("../utils/responseHelpers");

exports.createAccount = async (req, res) => {
  try {
    const { accountHolderName, accountNumber, bankName, userId } = req.body;

    if (!accountHolderName || !accountNumber || !bankName || !userId) {
      return response.badRequest(res, "Please provide all required fields.");
    }

    const existingAccount = await Account.findOne({ accountNumber });
    if (existingAccount) {
      return response.badRequest(res, "Account with this number already exists.");
    }

    const account = await Account.create({
      accountHolderName,
      accountNumber,
      bankName,
      user: userId,
    });

    response.success(res, "Account created successfully", {
      status: "success",
      data: { account },
    });
  } catch (error) {
    response.serverError(res, "Erorr creating account");
    console.error("Error in account creation", error);
  }
};

exports.getAccountByNo = async (req, res) => {
  try {
    const accountNumber = req.query.accountNumber;
    if (!accountNumber) {
      return response.badRequest(res, "Account number is mandatory");
    }

    const account = await Account.findOne({ accountNumber }).populate("user");

    if (!account) {
      return response.badRequest(res, "No account associated with that number");
    }

    response.success(res, "Account fetched successfully", {
      status: "success",
      data: {
        account,
      },
    });
  } catch (err) {
    console.error("Error fetching accounts", err);
    response.serverError(res, "Error fetching account.", err.message);
  }
};

exports.getAllAccounts = async (req, res) => {
  try {
    const {
      accountHolderName,
      accountNumber,
      bankName,
      user,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (accountHolderName) {
      filter.accountHolderName = { $regex: accountHolderName, $options: "i" };
    }

    if (accountNumber) {
      filter.accountNumber = { $regex: accountNumber, $options: "i" };
    }

    if (bankName) {
      filter.bankName = { $regex: bankName, $options: "i" };
    }

    if (user) {
      filter.user = user;
    }

    const skip = (page - 1) * limit;

    const accounts = await Account.find(filter)
      .populate("user")
      .skip(skip)
      .limit(Number(limit));

    const totalCount = await Account.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: accounts,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching accounts.",
      error: error.message,
    });
  }
};

exports.updateAccount = async (req, res) => {
  const accountId = req.query.accountId;
  if (!accountId) {
    return response.badRequest(res, "Account ID is mandatory");
  }

  const account = await Account.findByIdAndUpdate(accountId, req.body, {
    new: true,
  });
  if (!account) {
    return response.badRequest(res, "No account found with that ID.");
  }

  response.success(res, "Account updated successfuly.", {
    status: "success",
    data: {
      account,
    },
  });
};

exports.deleteAccount = async (req, res) => {
  const accountId = req.query.accountId;
  if (!accountId) {
    return response.badRequest(res, "Account ID is mandatory");
  }

  const account = await Account.findByIdAndDelete(accountId);
  if (!account) {
    return response.badRequest(res, "No account found with that ID.");
  }

  response.success(res, "Account deleted successfuly.", {
    status: "success",
    data: {
      account: null,
    },
  });
};
