const express = require("express");
const router = express.Router();
const otpController = require("../controllers/AuthencationController");

//Save otp
router.post("/save_otp", otpController.saveOtp);

// Verift otp
router.post("/verify_otp", otpController.verifyOTP);

module.exports = router;
