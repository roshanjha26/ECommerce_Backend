const express = require("express");
const ErrorHandler = require("./util/errorHandler");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static("uploads"));
app.use(cookieParser());

app.use(cors());
//import routes
const user = require("./routes/userRoutes");

app.use("/api/v1/user", user);

app.use(ErrorHandler);

module.exports = app;
