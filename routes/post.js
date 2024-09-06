const express = require("express");
const router = express.Router();
const controller = require("../controllers/PostController");

// default url : http://localhost:8000/posts/

router.post("/post_status", controller.postStatus);

module.exports = router;
