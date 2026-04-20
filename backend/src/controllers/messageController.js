const pool = require("../config/db");

// ===============================
// CREATE CONVERSATION
// ===============================
exports.createConversation = async (req, res) => {
    const { other_user_id } = req.body;
    const currentUserId = req.session.user_id;

    if (!currentUserId) return res.status(401).json({ message: "Unauthorized" });

    const [result] = await pool.query("INSERT INTO conversation () VALUES ()");
    const conversationId = result.insertId;

    await pool.query(
        `INSERT INTO conversation_participant (conversation_id, user_id)
         VALUES (?, ?), (?, ?)`,
        [conversationId, currentUserId, conversationId, other_user_id]
    );

    res.json({ conversation_id: conversationId });
};

// ===============================
// GET USER CONVERSATIONS
// ===============================
exports.getUserConversations = async (req, res) => {
    const userId = req.session.user_id;

    const [rows] = await pool.query(
        `SELECT c.conversation_id
         FROM conversation c
         JOIN conversation_participant cp
         ON c.conversation_id = cp.conversation_id
         WHERE cp.user_id = ?`,
        [userId]
    );

    res.json(rows);
};

// ===============================
// GET MESSAGES
// ===============================
exports.getMessagesByConversation = async (req, res) => {
    const { conversationId } = req.params;
    const currentUserId = req.session.user_id;

    if (!currentUserId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const [participantRows] = await pool.query(
            `SELECT conversation_participant_id
             FROM conversation_participant
             WHERE conversation_id = ? AND user_id = ?`,
            [conversationId, currentUserId]
        );

        if (participantRows.length === 0) {
            return res.status(403).json({
                message: "You are not part of this conversation"
            });
        }

        const [rows] = await pool.query(
            `SELECT
                m.message_id,
                m.conversation_id,
                m.sender_user_id,
                m.message_text,
                m.sent_at,
                m.is_read,
                mm.media_url,
                mm.media_type
             FROM message m
             LEFT JOIN message_media mm
                ON m.message_id = mm.message_id
             WHERE m.conversation_id = ?
             ORDER BY m.sent_at ASC`,
            [conversationId]
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("getMessagesByConversation error:", error);
        return res.status(500).json({
            message: "Failed to load messages"
        });
    }
};

// ===============================
// RENDER NEW MESSAGE PAGE
// ===============================
exports.renderNewMessagePage = async (req, res) => {
    const currentUserId = req.session.user_id;

    if (!currentUserId) {
        return res.redirect("/login?error=Please%20log%20in");
    }

    try {
        const [rows] = await pool.query(
            `SELECT user_id, username
             FROM user
             WHERE user_id != ?
             ORDER BY username ASC`,
            [currentUserId]
        );

        const suggestedUsers = rows.map((user) => ({
            user_id: user.user_id,
            name: user.username,
            username: `@${user.username}`,
            initials: user.username ? user.username.charAt(0).toUpperCase() : "?",
            status: "Active community member"
        }));

        return res.render("new-message", {
            activePage: "messages",
            suggestedUsers
        });
    } catch (error) {
        console.error("renderNewMessagePage error:", error);
        return res.status(500).send("Failed to load new message page");
    }
};

// ===============================
// RENDER MESSAGES PAGE
// ===============================
exports.renderMessagesPage = async (req, res) => {
    const currentUserId = req.session.user_id;

    if (!currentUserId) {
        return res.redirect("/login?error=Please%20log%20in");
    }

    try {
        let conversations = [];

        try {
            const [rows] = await pool.query(
                `SELECT
                    c.conversation_id AS id,
                    u.username AS name,
                    u.profile_pic_url AS avatar,
                    m.message_text AS lastMessage,
                    m.sent_at AS lastMessageTime,
                    mm.media_url
                 FROM conversation_participant cp
                 JOIN conversation c
                    ON cp.conversation_id = c.conversation_id
                 JOIN conversation_participant cp2
                    ON cp.conversation_id = cp2.conversation_id
                   AND cp2.user_id != cp.user_id
                 JOIN user u
                    ON cp2.user_id = u.user_id
                 LEFT JOIN message m
                    ON m.message_id = (
                        SELECT message_id
                        FROM message
                        WHERE conversation_id = c.conversation_id
                        ORDER BY sent_at DESC
                        LIMIT 1
                    )
                 LEFT JOIN message_media mm
                    ON m.message_id = mm.message_id
                 WHERE cp.user_id = ?
                 ORDER BY m.sent_at DESC`,
                [currentUserId]
            );

            conversations = rows.map((row) => ({
                id: row.id,
                name: row.name,
                avatar: row.avatar,
                initials: row.name
                    ? row.name.split(" ").map(word => word[0]).join("").toUpperCase()
                    : "?",
                lastMessage: row.lastMessage
                    ? row.lastMessage
                    : (row.media_url ? "📷 Image" : "Start a conversation"),
                timeAgo: formatTimeAgo(row.lastMessageTime)
            }));
        } catch (error) {
            console.error("Messages fallback:", error.message);
        }

        return res.render("messages", {
            activePage: "messages",
            conversations
        });
    } catch (error) {
        console.error("renderMessagesPage error:", error);
        return res.status(500).send("Failed to load messages page");
    }
};

// ===============================
// SEND MESSAGE
// ===============================
exports.sendMessage = async (req, res) => {
    const { conversation_id, message_text } = req.body;
    const senderUserId = req.session.user_id;

    if (!senderUserId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!conversation_id || !message_text || !message_text.trim()) {
        return res.status(400).json({
            message: "conversation_id and message_text are required"
        });
    }

    try {
        const [participantRows] = await pool.query(
            `SELECT conversation_participant_id
             FROM conversation_participant
             WHERE conversation_id = ? AND user_id = ?`,
            [conversation_id, senderUserId]
        );

        if (participantRows.length === 0) {
            return res.status(403).json({
                message: "You are not part of this conversation"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO message (conversation_id, sender_user_id, message_text)
             VALUES (?, ?, ?)`,
            [conversation_id, senderUserId, message_text.trim()]
        );

        const [sender] = await pool.query(
            `SELECT username FROM user WHERE user_id = ?`,
            [senderUserId]
        );

        const senderName = sender[0]?.username || "Someone";

        const [recipient] = await pool.query(
            `SELECT user_id
             FROM conversation_participant
             WHERE conversation_id = ? AND user_id != ?`,
            [conversation_id, senderUserId]
        );

        const io = req.app.get("io");

        if (recipient.length > 0) {
            const recipientUserId = recipient[0].user_id;

            await pool.query(
                `INSERT INTO notification (user_id, type, related_id, message, is_read)
                 VALUES (?, ?, ?, ?, 0)`,
                [
                    recipientUserId,
                    "new_message",
                    conversation_id,
                    `${senderName} sent you a message.`
                ]
            );

            if (io) {
                io.to(`user_${recipientUserId}`).emit("new_notification");
            }
        }

        await pool.query(
            `UPDATE conversation
             SET last_updated_at = CURRENT_TIMESTAMP
             WHERE conversation_id = ?`,
            [conversation_id]
        );

        const [messageRows] = await pool.query(
            `SELECT
                m.message_id,
                m.conversation_id,
                m.sender_user_id,
                m.message_text,
                m.sent_at,
                m.is_read,
                mm.media_url,
                mm.media_type
             FROM message m
             LEFT JOIN message_media mm
                ON m.message_id = mm.message_id
             WHERE m.message_id = ?`,
            [result.insertId]
        );

        const newMessage = messageRows[0];

        if (io) {
            io.to(`conversation_${conversation_id}`).emit("new_message", newMessage);
        }

        return res.status(201).json({
            message: "Message sent successfully",
            data: newMessage
        });
    } catch (error) {
        console.error("sendMessage error:", error);
        return res.status(500).json({
            message: "Failed to send message"
        });
    }
};

// ===============================
// SEND IMAGE
// ===============================
exports.sendImageMessage = async (req, res) => {
    const { conversation_id } = req.body;
    const senderUserId = req.session.user_id;

    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }

    try {
        // Save message (use placeholder text)
        const [result] = await pool.query(
            `INSERT INTO message (conversation_id, sender_user_id, message_text)
             VALUES (?, ?, ?)`,
            [conversation_id, senderUserId, "//image"]
        );

        const messageId = result.insertId;

        // Save media
        const mediaUrl = `/uploads/messages/${req.file.filename}`;

        await pool.query(
            `INSERT INTO message_media (message_id, media_url, media_type)
             VALUES (?, ?, ?)`,
            [messageId, mediaUrl, "image"]
        );

        // Fetch full message (important)
        const [rows] = await pool.query(
            `SELECT 
                m.message_id,
                m.conversation_id,
                m.sender_user_id,
                m.message_text,
                m.sent_at,
                mm.media_url
             FROM message m
             LEFT JOIN message_media mm ON m.message_id = mm.message_id
             WHERE m.message_id = ?`,
            [messageId]
        );

        const newMessage = rows[0];

        const io = req.app.get("io");

        // 🔥 THIS IS THE MISSING PART
        if (io) {
            io.to(`conversation_${conversation_id}`).emit("new_message", newMessage);
        }

        return res.status(201).json(newMessage);

    } catch (error) {
        console.error("sendImageMessage error:", error);
        return res.status(500).json({ message: "Failed to send image" });
    }
};

// ===============================
// START CONVERSATION
// ===============================
exports.startConversationAndRedirect = async (req, res) => {
    const { other_user_id, message_text } = req.body;
    const currentUserId = req.session.user_id;

    let conversationId;

    const [existing] = await pool.query(
        `SELECT cp1.conversation_id
         FROM conversation_participant cp1
         JOIN conversation_participant cp2
         ON cp1.conversation_id = cp2.conversation_id
         WHERE cp1.user_id = ? AND cp2.user_id = ?`,
        [currentUserId, other_user_id]
    );

    if (existing.length > 0) {
        conversationId = existing[0].conversation_id;
    } else {
        const [result] = await pool.query("INSERT INTO conversation () VALUES ()");
        conversationId = result.insertId;

        await pool.query(
            `INSERT INTO conversation_participant (conversation_id, user_id)
             VALUES (?, ?), (?, ?)`,
            [conversationId, currentUserId, conversationId, other_user_id]
        );
    }

    await pool.query(
        `INSERT INTO message (conversation_id, sender_user_id, message_text)
         VALUES (?, ?, ?)`,
        [conversationId, currentUserId, message_text]
    );

    res.redirect(`/chat/${conversationId}`);
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
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
}
