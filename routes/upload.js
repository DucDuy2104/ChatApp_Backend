const express = require('express');
const router = express.Router();
const uplaodController = require('../controllers/UploadController');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const fileType = file.mimetype;
        if (fileType.startsWith('image/')) {
            cb(null, 'public/images');
        } else if (fileType.startsWith('video/')) {
            cb(null, 'public/videos');
        } else {
            cb(new Error('Invalid file type'), false);
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (
            file.mimetype.startsWith('images/') ||
            file.mimetype.startsWith('videos/')
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed'));
        }
    }
});

router.post('/file', upload.single('file'), uplaodController.upLoadFile)

module.exports = router