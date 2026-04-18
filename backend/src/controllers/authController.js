const pool = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

function isHtmlRequest(req) {
    const acceptHeader = req.headers.accept || "";
    return acceptHeader.includes("text/html");
}

async function signup(req, res) {
    try {
        const username = req.body.username || req.body.fullname;
        const { email, password, confirmPassword } = req.body;

        if (!username || !email || !password) {
            if (isHtmlRequest(req)) {
                return res.redirect("/signup?error=All%20fields%20are%20required");
            }

            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (confirmPassword && password !== confirmPassword) {
            if (isHtmlRequest(req)) {
                return res.redirect("/signup?error=Passwords%20do%20not%20match");
            }

            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        const [users] = await pool.query(
            "SELECT user_id FROM user WHERE email = ? OR username = ? LIMIT 1",
            [email, username]
        );

        if (users.length > 0) {
            if (isHtmlRequest(req)) {
                return res.redirect("/signup?error=User%20already%20exists");
            }

            return res.status(400).json({
                message: "User already exists"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO user (username, email, password_hash) VALUES (?, ?, ?)",
            [username, email, passwordHash]
        );

        if (isHtmlRequest(req)) {
            return res.redirect("/login?message=Account%20created%20successfully.%20Please%20log%20in.");
        }

        return res.status(201).json({
            message: "User signed up successfully"
        });
    } catch (error) {
        console.error("Signup failed:", error);

        if (isHtmlRequest(req)) {
            return res.redirect("/signup?error=Signup%20failed");
        }

        return res.status(500).json({
            message: "Signup failed"
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            if (isHtmlRequest(req)) {
                return res.redirect("/login?error=Email%20and%20password%20are%20required");
            }

            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const [users] = await pool.query(
            "SELECT user_id, username, email, password_hash FROM user WHERE email = ? LIMIT 1",
            [email]
        );

        if (users.length === 0) {
            if (isHtmlRequest(req)) {
                return res.redirect("/login?error=Invalid%20email%20or%20password");
            }

            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            if (isHtmlRequest(req)) {
                return res.redirect("/login?error=Invalid%20email%20or%20password");
            }

            return res.status(403).json({
                message: "Invalid email or password"
            });
        }

        req.session.user_id = user.user_id;
        req.session.username = user.username;

        if (isHtmlRequest(req)) {
            return res.redirect("/create-post?message=Login%20successful");
        }

        return res.json({
            message: "Login successful",
            user: {
                id: user.user_id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login failed:", error);

        if (isHtmlRequest(req)) {
            return res.redirect("/login?error=Login%20failed");
        }

        return res.status(500).json({
            message: "Login failed"
        });
    }
}

async function forgotPassword(req, res) {
    const email = req.body.email;

    if (!email) {
        if (isHtmlRequest(req)) {
            return res.redirect("/forget-password?error=Email%20is%20required");
        }

        return res.status(400).json({
            message: "Email is required"
        });
    }

    try {
        const [users] = await pool.query(
            "SELECT user_id FROM user WHERE email = ? LIMIT 1",
            [email]
        );

        if (users.length === 0) {
            if (isHtmlRequest(req)) {
                return res.render("forget-password", {
                    activePage: "forget-password",
                    message: "If this email exists, a reset link will be shown below for local testing.",
                    error: "",
                    resetLink: ""
                });
            }

            return res.json({
                message: "If this email exists, a reset link will be created."
            });
        }

        const token = crypto.randomBytes(24).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await pool.query(
            "UPDATE user SET reset_token = ?, reset_expires = ? WHERE user_id = ?",
            [token, expiresAt, users[0].user_id]
        );

        const resetLink = `${req.protocol}://${req.get("host")}/reset-password?token=${token}`;

        console.log("Password reset link:", resetLink);

        if (isHtmlRequest(req)) {
            return res.render("forget-password", {
                activePage: "forget-password",
                message: "Reset link generated for local testing.",
                error: "",
                resetLink: resetLink
            });
        }

        return res.json({
            message: "Reset link generated",
            resetLink: resetLink
        });
    } catch (error) {
        console.error("Forgot password failed:", error);

        if (isHtmlRequest(req)) {
            return res.redirect("/forget-password?error=Reset%20request%20failed");
        }

        return res.status(500).json({
            message: "Reset request failed"
        });
    }
}

async function resetPassword(req, res) {
    const token = req.body.token;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (!token || !password || !confirmPassword) {
        if (isHtmlRequest(req)) {
            return res.redirect(`/reset-password?token=${token || ""}&error=All%20fields%20are%20required`);
        }

        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (password !== confirmPassword) {
        if (isHtmlRequest(req)) {
            return res.redirect(`/reset-password?token=${token}&error=Passwords%20do%20not%20match`);
        }

        return res.status(400).json({
            message: "Passwords do not match"
        });
    }

    try {
        const [users] = await pool.query(
            "SELECT user_id FROM user WHERE reset_token = ? AND reset_expires > NOW() LIMIT 1",
            [token]
        );

        if (users.length === 0) {
            if (isHtmlRequest(req)) {
                return res.redirect(`/reset-password?token=${token}&error=Reset%20link%20is%20invalid%20or%20expired`);
            }

            return res.status(400).json({
                message: "Reset link is invalid or expired"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await pool.query(
            "UPDATE user SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE user_id = ?",
            [passwordHash, users[0].user_id]
        );

        if (isHtmlRequest(req)) {
            return res.redirect("/login?message=Password%20reset%20successfully");
        }

        return res.json({
            message: "Password reset successfully"
        });
    } catch (error) {
        console.error("Reset password failed:", error);

        if (isHtmlRequest(req)) {
            return res.redirect(`/reset-password?token=${token || ""}&error=Password%20reset%20failed`);
        }

        return res.status(500).json({
            message: "Password reset failed"
        });
    }
}

module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword
};

