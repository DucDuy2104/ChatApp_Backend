const userModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");

//Create token
const createToken = (userId, phoneNumber, password) => {
  // Lấy secretKey từ biến môi trường
  const secretKey = process.env.SECRET_KEY;

  const payload = {
    userId: userId,
    phoneNumber: phoneNumber,
    password: password,
  };

  const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
  return token;
};

//Register => tên, mk, sdt, hình, năm sinh, giới tính
exports.register = async (req, res) => {
  let { name, password, phoneNumber, avatar, birthday, gender } = req.body;
  try {
    // Validate name
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "Name is required and must be a non-empty string" });
    }

    // Validate password
    if (password.trim() === "" || password.length < 6) {
      return res.status(400).json({
        message: "Password is required and must be at least 6 characters long",
      });
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      return res
        .status(400)
        .json({ message: "A valid phone number is required" });
    }

    //Validate avatar
    if (avatar.trim() === "") {
      avatar =
        "https://i.pinimg.com/736x/10/6d/77/106d7765ff225167f18019f8f50f1d73.jpg";
    }
    if (typeof name !== "string") {
      return res
        .status(400)
        .json({ message: "Avatar must be a non-empty string" });
    }

    // Validate birthday
    if (!birthday) {
      return res.status(400).json({ message: "Birthday is required" });
    }

    // Validate gender
    const validGenders = ["Male", "Female", "Other"];
    if (!gender || !validGenders.includes(gender)) {
      return res.status(400).json({
        message: "Gender is required and must be Male, Female, or Other",
      });
    }

    const existingUser = await userModel.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const pass = bcrypt.hashSync(password, salt);

    const newUser = new userModel({
      name: name,
      phoneNumber: phoneNumber,
      password: pass,
      avatar: avatar,
      birthday: birthday,
      gender: gender,
    });

    await newUser.save();
    const { passWord, ...user } = newUser.toObject();

    return res.status(200).json({
      status: true,
      message: "Register success!",
      data: { ...user },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//Login
exports.login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber) {
      return res
        .status(400)
        .json({ message: "Don't leave phone number blank!" });
    }

    if (password.trim() === "") {
      return res.status(400).json({ message: "Don't leave password blank!" });
    }

    const user = await userModel.findOne({ phoneNumber });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid phone number or password" });
    }

    // Check password is correct
    const isMatch = bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid phone number or password" });
    }

    const token = createToken(user._id, phoneNumber, password);

    const { password: userPassword, ...userData } = user.toObject();
    const data = {
      ...userData,
      token,
    };

    return res.status(200).json({
      status: true,
      message: "Login success",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
