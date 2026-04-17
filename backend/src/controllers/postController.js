const pool = require("../config/db");

function isHtmlRequest(req) {
    const acceptHeader = req.headers.accept || "";
    return acceptHeader.includes("text/html");
}

function formatTimeAgo(dateString) {
    if (!dateString) {
        return "";
    }

    const postDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - postDate;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
        return "Just now";
    }

    if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
    }

    if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    }

    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

async function createPost(req, res) {
    try {
        const body = req.body || {};
        const userId = req.session && req.session.user_id ? req.session.user_id : body.user_id;
        const { caption, category, location_tag } = body;

        if (!userId || !category) {
            if (isHtmlRequest(req)) {
                return res.redirect("/create-post?error=Please%20log%20in%20first");
            }

            return res.status(400).json({
                message: "user_id and category are required"
            });
        }

        const [result] = await pool.query(
            "INSERT INTO post (user_id, caption, category, location_tag) VALUES (?, ?, ?, ?)",
            [userId, caption || null, category, location_tag || null]
        );

        if (req.file) {
            const mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";
            const mediaUrl = "/uploads/" + req.file.filename;

            await pool.query(
                "INSERT INTO post_media (post_id, media_type, meda_url, upload_order) VALUES (?, ?, ?, ?)",
                [result.insertId, mediaType, mediaUrl, 1]
            );
        }

        if (isHtmlRequest(req)) {
            return res.redirect("/feed?message=Post%20created%20successfully");
        }

        return res.status(201).json({
            message: "Post created successfully",
            post_id: result.insertId
        });
    } catch (error) {
        console.error("Create post failed:", error);

        if (isHtmlRequest(req)) {
            return res.redirect("/create-post?error=Create%20post%20failed");
        }

        return res.status(500).json({
            message: "Create post failed",
            error: error.message
        });
    }
}

async function getFeed(req, res) {
    try {
        const [posts] = await pool.query(
            "SELECT p.post_id, p.caption, p.category, p.creation_date, p.location_tag, u.user_id, u.username, u.profile_pic_url, pm.meda_url, pm.media_type FROM post p JOIN user u ON p.user_id = u.user_id LEFT JOIN post_media pm ON p.post_id = pm.post_id AND pm.upload_order = 1 WHERE p.is_public = 1 ORDER BY p.creation_date DESC"
        );

        return res.json(posts);
    } catch (error) {
        console.error("Get feed failed:", error);
        return res.status(500).json({
            message: "Failed to load feed",
            error: error.message
        });
    }
}

async function getFeedPage(req, res) {
    try {
        const [posts] = await pool.query(
            "SELECT p.post_id, p.caption, p.creation_date, u.username, u.profile_pic_url, COUNT(DISTINCT pl.like_id) AS likes, COUNT(DISTINCT c.comment_id) AS comments, MAX(pm.meda_url) AS media_url, MAX(pm.media_type) AS media_type FROM post p JOIN user u ON p.user_id = u.user_id LEFT JOIN post_like pl ON p.post_id = pl.post_id LEFT JOIN comment c ON p.post_id = c.post_id LEFT JOIN post_media pm ON p.post_id = pm.post_id AND pm.upload_order = 1 WHERE p.is_public = 1 GROUP BY p.post_id, p.caption, p.creation_date, u.username, u.profile_pic_url ORDER BY p.creation_date DESC"
        );

        const feedPosts = posts.map((post) => {
            return {
                id: post.post_id,
                author: post.username,
                authorSlug: post.username,
                authorAvatar: post.profile_pic_url || "",
                content: post.caption || "No caption",
                timeAgo: formatTimeAgo(post.creation_date),
                image: post.media_url || "",
                mediaType: post.media_type || "",
                likes: post.likes || 0,
                comments: post.comments || 0
            };
        });

        return res.render("feed", {
            activePage: "feed",
            posts: feedPosts,
            message: req.query.message || "",
            error: req.query.error || ""
        });
    } catch (error) {
        console.error("Load feed page failed:", error);
        return res.status(500).send("Failed to load feed page");
    }
}

async function getCreatePostPage(req, res) {
    const userId = req.session && req.session.user_id ? req.session.user_id : req.query.user_id || "";
    let username = req.session && req.session.username ? req.session.username : "";

    if (!username && userId) {
        try {
            const [users] = await pool.query(
                "SELECT username FROM user WHERE user_id = ? LIMIT 1",
                [userId]
            );

            if (users.length > 0) {
                username = users[0].username;
            }
        } catch (error) {
            console.error("Load username failed:", error);
        }
    }

    return res.render("create-post", {
        activePage: "feed",
        message: req.query.message || "",
        error: req.query.error || "",
        userId: userId,
        username: username
    });
}

async function getPostDetailsPage(req, res) {
    try {
        const postId = req.params.id;

        const [posts] = await pool.query(
            "SELECT p.post_id, p.caption, p.creation_date, u.username, COUNT(DISTINCT pl.like_id) AS likes, COUNT(DISTINCT c.comment_id) AS comments, MAX(pm.meda_url) AS media_url, MAX(pm.media_type) AS media_type FROM post p JOIN user u ON p.user_id = u.user_id LEFT JOIN post_like pl ON p.post_id = pl.post_id LEFT JOIN comment c ON p.post_id = c.post_id LEFT JOIN post_media pm ON p.post_id = pm.post_id AND pm.upload_order = 1 WHERE p.post_id = ? GROUP BY p.post_id, p.caption, p.creation_date, u.username",
            [postId]
        );

        if (posts.length === 0) {
            return res.status(404).send("Post not found");
        }

        const [commentRows] = await pool.query(
            "SELECT c.content, c.created_at, u.username FROM comment c JOIN user u ON c.user_id = u.user_id WHERE c.post_id = ? ORDER BY c.created_at ASC",
            [postId]
        );

        const post = posts[0];

        return res.render("post-details", {
            activePage: "feed",
            post: {
                id: post.post_id,
                author: post.username,
                content: post.caption || "No caption",
                timeAgo: formatTimeAgo(post.creation_date),
                fullDate: new Date(post.creation_date).toLocaleString(),
                image: post.media_url || "",
                mediaType: post.media_type || "",
                likes: post.likes || 0,
                comments: post.comments || 0,
                commentList: commentRows.map((comment) => {
                    return {
                        author: comment.username,
                        text: comment.content,
                        timeAgo: formatTimeAgo(comment.created_at)
                    };
                })
            }
        });
    } catch (error) {
        console.error("Load post details failed:", error);
        return res.status(500).send("Failed to load post details");
    }
}

module.exports = {
    createPost,
    getFeed,
    getFeedPage,
    getCreatePostPage,
    getPostDetailsPage
};
