const pool = require("../config/db");

exports.getSettingsPage = async (req, res) => {
    const userId = req.session.user_id;

    if (!userId) {
        return res.redirect("/login?error=Please%20log%20in");
    }

    try {
        const [rows] = await pool.query(
            `SELECT username, email, profile_pic_url, bio, is_private_account
             FROM user
             WHERE user_id = ?`,
            [userId]
        );

        const user = rows[0];

        res.render("settings", {
            activePage: "profile",
            user
        });

    } catch (error) {
        console.error("Settings load error:", error);
        res.status(500).send("Failed to load settings");
    }
};

exports.updatePrivacy = async (req, res) => {
    const userId = req.session.user_id;

    if (!userId) {
        return res.redirect("/login");
    }

    const isPrivate = req.body.is_private ? 1 : 0;

    try {
        await pool.query(
            `UPDATE user SET is_private_account = ? WHERE user_id = ?`,
            [isPrivate, userId]
        );

        res.redirect("/settings");

    } catch (error) {
        console.error("Privacy update error:", error);
        res.status(500).send("Failed to update privacy");
    }
};

exports.updateProfile = async (req, res) => {
    const userId = req.session.user_id;

    if (!userId) {
        return res.redirect("/login");
    }

    const { bio } = req.body;

    try {
        await pool.query(
            `UPDATE user SET bio = ? WHERE user_id = ?`,
            [bio, userId]
        );

        res.redirect("/settings");

    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).send("Failed to update profile");
    }
};

/*Account Info*/

const bcrypt = require("bcrypt");

exports.updateAccountInfo = async (req, res) => {
    const userId = req.session.user_id;

    if (!userId) {
        return res.redirect("/login");
    }

    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).send("Username and email are required");
    }

    try {
        await pool.query(
            `UPDATE user
             SET username = ?, email = ?
             WHERE user_id = ?`,
            [username.trim(), email.trim(), userId]
        );

        req.session.username = username.trim();

        res.redirect("/settings");
    } catch (error) {
        console.error("Account update error:", error);
        res.status(500).send("Failed to update account info");
    }
};

/*Update Password*/

exports.updatePassword = async (req, res) => {
    const userId = req.session.user_id;

    if (!userId) {
        return res.redirect("/login");
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).send("Both password fields are required");
    }

    try {
        const [rows] = await pool.query(
            `SELECT password_hash
             FROM user
             WHERE user_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).send("User not found");
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isMatch) {
            return res.status(400).send("Current password is incorrect");
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await pool.query(
            `UPDATE user
             SET password_hash = ?
             WHERE user_id = ?`,
            [newPasswordHash, userId]
        );

        res.redirect("/settings");
    } catch (error) {
        console.error("Password update error:", error);
        res.status(500).send("Failed to update password");
    }
};

/*Update Profile Pic*/

exports.updateProfilePicture = async (req, res) => {
    const userId = req.session.user_id;

    if (!userId) {
        return res.redirect("/login");
    }

    if (!req.file) {
        return res.status(400).send("No image uploaded");
    }

    try {
        const imagePath = `/uploads/profile/${req.file.filename}`;

        await pool.query(
            `UPDATE user
             SET profile_pic_url = ?
             WHERE user_id = ?`,
            [imagePath, userId]
        );

        res.redirect("/settings");
    } catch (error) {
        console.error("Profile picture update error:", error);
        res.status(500).send("Failed to update profile picture");
    }
};