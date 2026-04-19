const pool = require("../config/db");

function makeSlug(text) {
    if (!text) {
        return "";
    }

    return text
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getInitials(text) {
    if (!text) {
        return "U";
    }

    const parts = text.trim().split(/\s+/);

    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function mapProfilePost(post) {
    return {
        id: post.post_id,
        image: post.media_url || "",
        label: post.caption || "Post"
    };
}

async function getUserStats(userId) {
    const [postRows] = await pool.query(
        "SELECT COUNT(*) AS total FROM post WHERE user_id = ?",
        [userId]
    );

    const [followerRows] = await pool.query(
        "SELECT COUNT(*) AS total FROM user_follow WHERE following_id = ?",
        [userId]
    );

    const [followingRows] = await pool.query(
        "SELECT COUNT(*) AS total FROM user_follow WHERE follower_id = ?",
        [userId]
    );

    return {
        posts: postRows[0] ? postRows[0].total : 0,
        followers: followerRows[0] ? followerRows[0].total : 0,
        following: followingRows[0] ? followingRows[0].total : 0
    };
}

async function getUserPosts(userId) {
    const [rows] = await pool.query(
        "SELECT p.post_id, p.caption, MAX(pm.meda_url) AS media_url FROM post p LEFT JOIN post_media pm ON p.post_id = pm.post_id AND pm.upload_order = 1 WHERE p.user_id = ? GROUP BY p.post_id, p.caption ORDER BY p.creation_date DESC",
        [userId]
    );

    return rows.map(mapProfilePost);
}

async function getSavedPosts(userId) {
    const [rows] = await pool.query(
        "SELECT p.post_id, p.caption, MAX(pm.meda_url) AS media_url FROM post_save ps JOIN post p ON ps.post_id = p.post_id LEFT JOIN post_media pm ON p.post_id = pm.post_id AND pm.upload_order = 1 WHERE ps.user_id = ? GROUP BY p.post_id, p.caption ORDER BY ps.saved_at DESC",
        [userId]
    );

    return rows.map(mapProfilePost);
}

async function loadUserById(userId) {
    const [rows] = await pool.query(
        "SELECT user_id, username, profile_pic_url, bio, location FROM user WHERE user_id = ? LIMIT 1",
        [userId]
    );

    return rows[0] || null;
}

async function loadUserBySlug(slug) {
    const [rows] = await pool.query(
        "SELECT user_id, username, profile_pic_url, bio, location FROM user"
    );

    for (const user of rows) {
        if (makeSlug(user.username) === slug) {
            return user;
        }
    }

    return null;
}

async function getProfilePage(req, res) {
    const userId = req.session && req.session.user_id;

    if (!userId) {
        return res.redirect("/login?error=Please%20log%20in");
    }

    try {
        const user = await loadUserById(userId);

        if (!user) {
            return res.redirect("/login?error=User%20not%20found");
        }

        const stats = await getUserStats(user.user_id);
        const myPosts = await getUserPosts(user.user_id);
        const savedPosts = await getSavedPosts(user.user_id);

        return res.render("profile", {
            activePage: "profile",
            activeTab: "posts",
            profile: {
                name: user.username,
                username: "@" + user.username,
                bio: user.bio || "No bio added yet.",
                posts: stats.posts,
                followers: stats.followers,
                following: stats.following,
                avatar: user.profile_pic_url || "",
                initials: getInitials(user.username),
                myPosts: myPosts,
                savedPosts: savedPosts
            }
        });
    } catch (error) {
        console.error("Load profile failed:", error);
        return res.status(500).send("Failed to load profile");
    }
}

async function getSavedProfilePage(req, res) {
    const userId = req.session && req.session.user_id;

    if (!userId) {
        return res.redirect("/login?error=Please%20log%20in");
    }

    try {
        const user = await loadUserById(userId);

        if (!user) {
            return res.redirect("/login?error=User%20not%20found");
        }

        const stats = await getUserStats(user.user_id);
        const myPosts = await getUserPosts(user.user_id);
        const savedPosts = await getSavedPosts(user.user_id);

        return res.render("profile", {
            activePage: "profile",
            activeTab: "saved",
            profile: {
                name: user.username,
                username: "@" + user.username,
                bio: user.bio || "No bio added yet.",
                posts: stats.posts,
                followers: stats.followers,
                following: stats.following,
                avatar: user.profile_pic_url || "",
                initials: getInitials(user.username),
                myPosts: myPosts,
                savedPosts: savedPosts
            }
        });
    } catch (error) {
        console.error("Load saved profile failed:", error);
        return res.status(500).send("Failed to load saved posts");
    }
}

async function getUserProfilePage(req, res) {
    const slug = req.params.slug;
    const activeTab = req.query.tab === "about" ? "about" : "posts";

    try {
        const user = await loadUserBySlug(slug);

        if (!user) {
            return res.status(404).send("User not found");
        }

        const stats = await getUserStats(user.user_id);
        const posts = await getUserPosts(user.user_id);

        return res.render("user-profile", {
            activePage: "profile",
            activeTab: activeTab,
            user: {
                fullName: user.username,
                username: "@" + user.username,
                bio: user.bio || "No bio added yet.",
                about: user.bio || "No bio added yet.",
                posts: stats.posts,
                followers: stats.followers,
                following: stats.following,
                slug: makeSlug(user.username),
                avatar: user.profile_pic_url || "",
                initials: getInitials(user.username),
                postImages: posts
            }
        });
    } catch (error) {
        console.error("Load user profile failed:", error);
        return res.status(500).send("Failed to load user profile");
    }
}

module.exports = {
    getProfilePage,
    getSavedProfilePage,
    getUserProfilePage
};
