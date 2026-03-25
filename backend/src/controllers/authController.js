const pool = require("../config/db");
const bcrypt = require("bcrypt");

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

        if (isHtmlRequest(req)) {
            return res.redirect(`/create-post?message=Login%20successful&user_id=${user.user_id}`);
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

module.exports = {
    signup,
    login
};

