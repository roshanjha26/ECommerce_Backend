const ErrorHandler = require("../util/errorHandler");
const path = require("path");
const User = require("../model/userModel");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../util/sendMail");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../util/jwtToken");

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userEmail = await User.findOne({ email });

    if (userEmail) {
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
    const user = {
      name,
      email,
      password,
      avatar: fileUrl,
    };

    const activationToken = createActivationtoken(user);

    const activationUrl = `http://localhost:3000/activation/${activationToken}`;

    try {
      await sendMail({
        email: user.email,
        subject: "Activate your accout",
        message: `Hello ${user.name}. please click on the link to activate your account : ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `please check your email:-${user.email} to activate your account `,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
    // const newUser = await User.create(user);
    // res.status(201).json({
    //   success: true,
    //   newUser,
    // });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
};

//activation token
const createActivationtoken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

//activate user

exports.activateUser = catchAsyncError(async (req, res, next) => {
  try {
    const { activation_token } = req.body;

    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

    if (!newUser) {
      return next(new ErrorHandler("Invalid token", 400));
    }
    const { name, email, password, avatar } = newUser;

    let user = await User.findOne({ email });

    if (user) {
      return next(new ErrorHandler("User already Exists", 400));
    }

    user = await User.create({
      name,
      email,
      password,
      avatar,
    });

    sendToken(user, 201, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.login = catchAsyncError(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please provide all fields", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Incorrect Credentials", 400));
    }
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(new ErrorHandler("Incorrect Credentials", 400));
    }

    sendToken(user, 201, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

//load user

exports.getUser = catchAsyncError(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorHandler("User doen't exists", 400));
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.logout = catchAsyncError(async (req, res, next) => {
  try {
    res.cookies("token", null, {
      expires: new User(Date.now()),
      httpOnly: true,
    });
    res.status(201).json({
      success: true,
      message: "Log Out Succesfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
