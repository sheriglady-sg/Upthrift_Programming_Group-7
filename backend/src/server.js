const express = require("express");
const session = require("express-session");
require("dotenv").config();
const http = require("http"); //socket.io
const { Server } = require("socket.io"); //server

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const messageRoutes = require("./routes/messageRoutes");
const pool = require("./config/db");
const postController = require("./controllers/postController");
const storeController = require("./controllers/storeController");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "upthrift-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

app.set("io", io);

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

/* share session with socket*/
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

io.on("connection", (socket) => {
    const session = socket.request.session;

    if (!session || !session.user_id) {
        return socket.disconnect();
    }
    
    console.log("Socket connected:", socket.id, "User:", session.user_id);


/*Join conversation*/
    socket.on("join_conversation", (conversationId)=> {
        socket.join(`conversation_${conversationId}`);
    });

/*Leave conversation*/

    socket.on("leave_conversation", (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
    });

    /*Typing conversation*/

     socket.on("typing", ({ conversationId, userName }) => {
        socket.to(`conversation_${conversationId}`).emit("user_typing", { userName });
    });

     socket.on("stop_typing", ({ conversationId }) => {
        socket.to(`conversation_${conversationId}`).emit("user_stop_typing");
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);

    });
});

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
        error: req.query.error || "",
        resetLink: ""
    });
});

app.get("/reset-password", (req, res) => {
    res.render("reset-password", {
        activePage: "forget-password",
        token: req.query.token || "",
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
app.get("/discover", storeController.getDiscoverPage);
app.get("/store/:slug", storeController.getStorePage);
app.get("/store/:slug/review", storeController.getWriteReviewPage);
app.post("/store/:slug/review", storeController.postReview);

app.get("/chat/:conversationId", async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/login?error=Please%20log%20in");
    }

    const conversationId = req.params.conversationId;
    const currentUserId = req.session.user_id;

    try {
        const [currentUserRows] = await pool.query(
            `SELECT username
             FROM user
             WHERE user_id = ?
             LIMIT 1`,
            [currentUserId]
        );

        const [rows] = await pool.query(
            `SELECT u.user_id, u.username
             FROM conversation_participant cp
             INNER JOIN user u ON cp.user_id = u.user_id
             WHERE cp.conversation_id = ?
             AND cp.user_id != ?
             LIMIT 1`,
            [conversationId, currentUserId]
        );

        let otherUserName = "Chat";
        let otherUserId = null;
        let currentUserName = "User";

        if (currentUserRows.length > 0) {
            currentUserName = currentUserRows[0].username;
        }

        if (rows.length > 0) {
            otherUserName = rows[0].username;
            otherUserId = rows[0].user_id;
        }

        res.render("chatbox", {
            conversationId,
            userId: currentUserId,
            currentUserName,
            otherUserName,
            otherUserId
        });
    } catch (error) {
        console.error("Chat page load error:", error);
        return res.status(500).send("Failed to load chat");
    }
});

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
app.use("/messages", messageRoutes);

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

