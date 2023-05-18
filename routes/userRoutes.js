const express = require("express");
const router = express.Router();

const { upload } = require("../multer");
const { createUser } = require("../controllers/userController");

router.route("/create-user").post(upload.single("file"), createUser);

module.exports = router;
