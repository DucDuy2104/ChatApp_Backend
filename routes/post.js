const express = require("express");
const router = express.Router();
const controller = require("../controllers/PostController");

// default url : http://localhost:8000/posts/

router.post("/post_status", controller.postStatus);

router.get("/get_status_by_userId/:userId", controller.getStatus);

router.get("/get_status_detail/:idStatus", controller.getStatusDetail);

router.post("/update_status/:idStatus", controller.updateStatus);

router.post("/delete_status/:idStatus", controller.deleteStatus);

router.post("/like_status/:idStatus", controller.likePost);

module.exports = router;
