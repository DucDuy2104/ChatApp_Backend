const userModel = require("../models/UserModel");
const friendModel = require("../models/FriendModel");
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
    if (avatar.trim() === "" || !avatar) {
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
    const validGenders = ["Nam", "Nữ", "Khác"];
    if (!gender || !validGenders.includes(gender)) {
      return res.status(400).json({
        message: "Gender is required and must be Nam, Nữ, or Khác",
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

//Update information
exports.updateInformation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, avatar, background, birthday, gender, bio } = req.body;

    // Validate gender value
    if (gender && !["Nam", "Nữ", "Khác"].includes(gender)) {
      return res.status(400).json({
        status: false,
        message: "Invalid gender value",
      });
    }

    const currUser = await userModel.findById(userId);

    if (!currUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    currUser.name = name ? name : currUser.name;
    currUser.avatar = avatar ? avatar : currUser.avatar;
    currUser.background = background
      ? background
      : "https://i.pinimg.com/564x/13/9c/e2/139ce2aa86f4f8731439ec28851d2510.jpg";
    currUser.birthday = birthday ? birthday : currUser.birthday;
    currUser.bio = bio ? bio : currUser.bio;

    await currUser.save();

    return res.status(200).json({
      status: true,
      message: "Information updated successfully",
      data: currUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//Change phone number
exports.changePhoneNumber = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPhoneNumber } = req.body;

    // Check if the new phone number is unique
    const existingUser = await userModel.findOne({
      phoneNumber: newPhoneNumber,
    });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Phone number already in use",
      });
    }

    const currUser = await userModel.findById(userId);

    if (!currUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    currUser.phoneNumber = newPhoneNumber;

    await currUser.save();

    return res.status(200).json({
      status: true,
      message: "Phone number changed successfully",
      data: currUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//Change password
exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//Search user by phone number
exports.searchUser = async (req, res) => {
  try {
    const { phoneNumber, senderId } = req.body;

    const currentUser = await userModel.findById(senderId);
    if (!currentUser) {
      return res.status(404).json({ message: "Sender not found" });
    }

    const searchedUser = await userModel.findOne({ phoneNumber });
    if (!searchedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFriend = await friendModel.exists({
      users: { $all: [senderId, searchedUser._id] },
    });

    res.json({
      currentUser: currentUser._id,
      searchedUser: {
        id: searchedUser._id,
        name: searchedUser.name,
        phoneNumber: searchedUser.phoneNumber,
        avatar: searchedUser.avatar,
        bio: searchedUser.bio,
        gender: searchedUser.gender,
      },
      isFriend: !!isFriend, // boolean 
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
