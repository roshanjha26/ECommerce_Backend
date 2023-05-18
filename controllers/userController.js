const ErrorHandler = require("../util/errorHandler");
const path = require("path");
const User = require("../model/userModel");
const fs = require("fs");
exports.createUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  const userEmail = await User.findOne({ email });

  if (userEmail) {
    const filename = req.file.filename;
    const filePath = `uploads/${filename}`;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Error deleting file " });
      } else {
        res.json({ message: "File uplaoded successfully" });
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
  const newUser = await User.create(user);
  res.status(201).json({
    success: true,
    newUser,
  });
  console.log(user);
};
