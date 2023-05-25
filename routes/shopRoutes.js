const express = require("express");
const router = express.Router();

const { isAuthenticated } = require("../middleware/auth");
const { upload } = require("../multer");
const { createShop, activateSeller } = require("../controllers/shopController");

router.route("/create-shop").post(upload.single("file"), createShop);
router.route("/activation").post(activateSeller);

module.exports = router;
