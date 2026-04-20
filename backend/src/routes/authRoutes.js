const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { handleValidationErrors } = require("../middleware/validation");
const {
    signupValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation
} = require("../middleware/validators");

router.post("/signup", signupValidation, handleValidationErrors("/signup"), authController.signup); //signup
router.post("/login", loginValidation, handleValidationErrors("/login"), authController.login); //login
router.post("/forgot-password", forgotPasswordValidation, handleValidationErrors("/forget-password"), authController.forgotPassword); //forgot password
router.post("/reset-password", resetPasswordValidation, handleValidationErrors((req) => `/reset-password?token=${encodeURIComponent(req.body.token || "")}`), authController.resetPassword); //reset
router.post("/logout", authController.logout); // logout

module.exports = router;
