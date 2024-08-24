const express = require("express");
const router = express.Router();
const controller = require("../controllers/UserController");

//Register
router.post("/register", controller.register);

//Login
router.post("/login", controller.login);

//Update information
router.post("/update_information/:userId", controller.updateInformation);

//Change phone number
router.post("/change_phonenumber/:userId", controller.changePhoneNumber);

//Change password
router.post("/changePassword/:userId", controller.changePassword);

//Search friend
router.post("/searchFriendByPhoneNumber", controller.searchUser)

module.exports = router;
