const express = require("express");
const path = require("path");

const app = express();

//Telling express to use EJS
app.set("view engine", "ejs");

//Telling express where the views are
app.set("views", path.join(__dirname, "views"));

//Serve static files
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index");
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
