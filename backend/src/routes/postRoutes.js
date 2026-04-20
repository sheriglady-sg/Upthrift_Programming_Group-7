const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const { createPost, getFeed, toggleLike, toggleSave, addComment } = require("../controllers/postController");
const { handleValidationErrors } = require("../middleware/validation");
const { createPostValidation, commentValidation } = require("../middleware/validators");

const uploadFolder = path.join(__dirname, "..", "public", "uploads");

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
            cb(null, true);
            return;
        }

        cb(new Error("Only image and video files are allowed"));
    }
});

router.post("/", upload.single("media"), createPostValidation, handleValidationErrors("/create-post"), createPost);
router.post("/:id/like", toggleLike);
router.post("/:id/save", toggleSave);
router.post("/:id/comment", commentValidation, handleValidationErrors((req) => `/post/${req.params.id}`), addComment);
router.get("/", getFeed);

module.exports = router;
