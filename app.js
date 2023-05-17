const express = require("express");
const ErrorHandler = require("./util/errorHandler");
const app = express();
const cookieParser = require("cookie-parser");

const fileUpload = require("express-fileupload");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(fileUpload({ useTempFiles: true }));

app.use(ErrorHandler);

module.exports = app;
