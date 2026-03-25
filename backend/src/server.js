const express = require("express");
require("dotenv").config();



const app = express();
const pool = require("./config/db");

// Middleware to parse JSON bodies in requests
app.use(express.json());

// Set EJS as the templating engine and specify the views directory
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// static
app.use(express.static(__dirname + "/public"));

//home page
app.get("/", (req, res) => {
    res.render("index");
});

//contact page
app.get('/contact', (req, res) => {
    res.render('contact');
});

// database test route
app.get("/test-db", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT NOW() AS now");
        res.json({
            messsage: "Database connection successful",
            data: rows
        });
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
        });

const port = process.eventNames.port || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

