const pool = require("../config/db");

exports.renderNotificationsPage = async (req, res) => {
    const currentUserId = req.session.user_id;

    if (!currentUserId) {
        return res.redirect("/login?error=Please%20log%20in");
    }

    try {
        let notifications = [];

        try {
            const [rows] = await pool.query(
                `SELECT notification_id, type, message, is_read, created_at, related_id
                 FROM notification
                 WHERE user_id = ?
                 ORDER BY created_at DESC`,
                [currentUserId]
            );

            notifications = rows.map((row) => ({
                id: row.notification_id,
                type: row.type,
                message: row.message,
                isRead: row.is_read,
                timeAgo: formatTimeAgo(row.created_at),
                iconClass: getIconClass(row.type),
                iconSrc: getIconSrc(row.type),
                link: getNotificationLink(row.type, row.related_id)
            }));

            await pool.query(
                `UPDATE notification
                 SET is_read = 1
                 WHERE user_id = ? AND is_read = 0`,
                [currentUserId]
            );
        } catch (error) {
            console.error("Notification fallback:", error.message);
        }

        return res.render("notifications", {
            activePage: "notifications",
            notifications
        });
    } catch (error) {
        console.error("renderNotificationsPage error:", error);
        return res.status(500).send("Failed to load notifications");
    }
};

function formatTimeAgo(dateValue) {
    if (!dateValue) return "";

    const now = new Date();
    const then = new Date(dateValue);
    const diffMs = now - then;

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
}

function getIconClass(type) {
    if (type === "new_like") return "type-like";
    if (type === "new_comment") return "type-comment";
    if (type === "new_follower") return "type-follow";
    return "type-system";
}

function getIconSrc(type) {
    if (type === "new_like") return "/images/Heart_02.svg";
    if (type === "new_comment") return "/images/Chat_Circle_Dots.svg";
    if (type === "new_follower") return "/images/User_Circle.png";
    return "/images/Calendar1.svg";
}

function getNotificationLink(type, relatedId) {
    if (type === "new_message") {
        return `/chat/${relatedId}`;
    }

    return "#";
}
