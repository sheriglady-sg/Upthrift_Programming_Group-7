const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const upload = require("../config/profileUpload");


router.get("/", settingsController.getSettingsPage);
router.post("/privacy", settingsController.updatePrivacy); //privacy
router.post("/profile", settingsController.updateProfile); //profile
router.post("/account", settingsController.updateAccountInfo); //update
router.post("/password", settingsController.updatePassword); //update password
router.post("/profile-picture", upload.single("profile_photo"), settingsController.updateProfilePicture);

module.exports = router;