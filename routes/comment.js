const express = require("express");
const router = express.Router();
const controller = require("../controllers/CommentController");

//default url : http://localhost:8000/comments/

router.post("/add_comment/:postId", controller.createNewCmt);

router.post("/getall_comment/:postId", controller.getAllCmt);

router.post("/update_comment/:commentId", controller.updatedCmt);

router.post("/delete_comment/:commentId", controller.deleteComment);

module.exports = router;
