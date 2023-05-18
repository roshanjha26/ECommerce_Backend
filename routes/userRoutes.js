const express = require("express");
const router = express.Router();

const { upload } = require("../multer");
const {
  createUser,
  activateUser,
  login,
  getUser,
} = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/auth");

router.route("/create-user").post(upload.single("file"), createUser);
router.route("/activation").post(activateUser);
router.route("/login-user").post(login);
router.route("/get-user").get(isAuthenticated, getUser);

module.exports = router;
