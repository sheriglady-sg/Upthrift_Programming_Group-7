const express = require("express");
const router = express.Router();
const { createPost, getFeed } = require("../controllers/postController");

router.post("/", createPost);
router.get("/", getFeed);

module.exports = router;
