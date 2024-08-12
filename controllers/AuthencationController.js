const OTP = require("../models/AuthenticationModel");

exports.saveOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    if (!otp) {
      return res.status(400).json({ message: "Otp is required" });
    }

    const check = await OTP.findOne({ phoneNumber: phoneNumber });
    if (check) {
      return res.status(400).json({ message: "This phone number is existing" });
    }

    const newOtp = new OTP({
      phoneNumber: phoneNumber,
      otp: otp,
    });

    await newOtp.save();

    if (!newOtp) {
      return res.status(400).json({ message: "Error to save" });
    }

    return res.status(200).json({
      status: true,
      message: "Save otp successfully!",
      data: newOtp,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ message: 'Phone number and OTP are required.' });
  }

  try {
    // Find the OTP record
    const record = await OTP.findOne({ phoneNumber });

    if (!record) {
      return res.status(404).json({ message: 'Phone number not found.' });
    }

    // Check if the OTP matches and is not expired
    if (record.otp === otp) {
      return res.status(200).json({ message: 'OTP verified successfully.' });
    } else {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};