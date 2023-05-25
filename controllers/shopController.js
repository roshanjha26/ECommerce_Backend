const Shop = require("../model/shopModel");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../util/errorHandler");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const sendMail = require("../util/sendMail");
const sendToken = require("../util/jwtToken");

exports.createShop = async (req, res, next) => {
  try {
    const { email } = req.body;

    const sellerMail = await Shop.findOne({ email });

    if (sellerMail) {
      const filename = req.file.filename;
      const filePath = `uploads/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting file " });
        }
      });
      return next(new ErrorHandler("User Already Exists", 400));
    }

    const filename = req.file.filename;
    const fileUrl = path.join(filename);

    const seller = {
      name: req.body.name,
      email,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      zipCode: req.body.zipCode,
      password: req.body.password,
      avatar: fileUrl,
    };

    const activationToken = createActivationtoken(seller);

    const activationUrl = `http://localhost:3000/activation/${activationToken}`;

    try {
      await sendMail({
        email: seller.email,
        subject: "Activate your accout",
        message: `Hello ${seller.name}. please click on the link to activate your account : ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `please check your email:-${seller.email} to activate your account `,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
};

//activation token
const createActivationtoken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

exports.activateSeller = catchAsyncError(async (req, res, next) => {
  try {
    const { activation_token } = req.body;

    const newSeller = jwt.verify(
      activation_token,
      process.env.ACTIVATION_SECRET
    );

    if (!newSeller) {
      return next(new ErrorHandler("Invalid token", 400));
    }
    const { name, email, password, avatar, zipCode, address, phoneNumber } =
      newUser;

    let seller = await Shop.findOne({ email });

    if (seller) {
      return next(new ErrorHandler("User already Exists", 400));
    }

    seller = await Shop.create({
      name,
      email,
      avatar,
      password,
      zipCode,
      address,
      phoneNumber,
    });

    sendToken(seller, 201, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
