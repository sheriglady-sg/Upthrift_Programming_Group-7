const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.post("/signup", authController.signup); //signup
router.post("/login", authController.login); //login
router.post("/forgot-password", authController.forgotPassword); //forgot password
router.post("/reset-password", authController.resetPassword); //reset
router.post("/logout", authController.logout); // logout

module.exports = router;
