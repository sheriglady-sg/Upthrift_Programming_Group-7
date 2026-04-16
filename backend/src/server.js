const express = require("express");
const session = require("express-session");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const pool = require("./config/db");
const postController = require("./controllers/postController");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || "upthrift-session-secret",
    resave: false,
    saveUninitialized: false
}));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.render("index", {
        activePage: ""
    });
});

app.get("/about", (req, res) => {
    res.render("about", {
        activePage: "about"
    });
});

app.get("/contact", (req, res) => {
    res.render("contact", {
        activePage: "contact",
        message: req.query.message || ""
    });
});

app.get("/login", (req, res) => {
    res.render("login", {
        activePage: "login",
        message: req.query.message || "",
        error: req.query.error || ""
    });
});

app.get("/signup", (req, res) => {
    res.render("signup", {
        activePage: "signup",
        message: req.query.message || "",
        error: req.query.error || ""
    });
});

app.get("/forget-password", (req, res) => {
    res.render("forget-password", {
        activePage: "forget-password",
        message: req.query.message || "",
        error: req.query.error || ""
    });
});

app.get("/get-started", (req, res) => {
    res.redirect("/signup");
});

app.get('/settings', (req, res) => {
    res.render('settings', { 
        activePage: 'profile' 
    }); 
});

app.get('/notifications', (req, res) => {
    res.render('notifications', { 
        activePage: 'messages' 
    }); 
});

app.get('/legal', (req, res) => {
    res.render('legal', { 
        activePage: 'legal' 
    }); 
});

app.get("/feed", postController.getFeedPage);
app.get("/create-post", postController.getCreatePostPage);
app.get("/post/:id", postController.getPostDetailsPage);

app.post("/send-message", (req, res) => {
    return res.redirect("/contact?message=Message%20sent%20successfully");
});

app.get("/test-db", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT NOW() AS now");
        return res.json({
            message: "Database connection successful",
            data: rows
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        return res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
