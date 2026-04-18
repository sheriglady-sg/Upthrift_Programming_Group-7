const pool = require("../config/db");
const eventsData = require("../data/eventsData");

let eventsLoaded = false;

function makeSlug(text) {
    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function makeEventSlug(event) {
    return `${makeSlug(event.title)}-${event.event_id}`;
}

function getEventImage(index, imageUrl) {
    if (imageUrl) {
        return imageUrl;
    }

    const images = [
        "/images/event1.jpg",
        "/images/event2.jpg",
        "/images/event3.jpg"
    ];

    return images[index % images.length];
}

function getShortLocation(address) {
    const parts = String(address || "").split(",");

    if (parts.length >= 2) {
        return `${parts[0].trim()}, ${parts[1].trim()}`;
    }

    return String(address || "Location to be confirmed");
}

function formatDateRange(startValue, endValue) {
    const start = new Date(startValue);
    const end = new Date(endValue);

    if (Number.isNaN(start.getTime())) {
        return "";
    }

    const startLabel = start.toLocaleDateString("en-IE", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    if (Number.isNaN(end.getTime()) || start.toDateString() === end.toDateString()) {
        return startLabel;
    }

    const endLabel = end.toLocaleDateString("en-IE", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    return `${startLabel} - ${endLabel}`;
}

function formatTimeRange(startValue, endValue) {
    const start = new Date(startValue);
    const end = new Date(endValue);

    if (Number.isNaN(start.getTime())) {
        return "Time to be confirmed";
    }

    const startIsMidnight = start.getHours() === 0 && start.getMinutes() === 0;
    const endIsMidnight = Number.isNaN(end.getTime()) || (end.getHours() === 0 && end.getMinutes() === 0);

    if (startIsMidnight && endIsMidnight) {
        if (!Number.isNaN(end.getTime()) && start.toDateString() !== end.toDateString()) {
            return "Multi-day event";
        }

        return "Time to be confirmed";
    }

    const startLabel = start.toLocaleTimeString("en-IE", {
        hour: "numeric",
        minute: "2-digit"
    });

    if (Number.isNaN(end.getTime()) || start.toDateString() !== end.toDateString()) {
        return startLabel;
    }

    const endLabel = end.toLocaleTimeString("en-IE", {
        hour: "numeric",
        minute: "2-digit"
    });

    return `${startLabel} - ${endLabel}`;
}

function getDirectionsUrl(address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || "")}`;
}

async function ensureEventsInDatabase() {
    if (eventsLoaded) {
        return;
    }

    for (const event of eventsData) {
        await pool.query(
            `INSERT INTO event
                (event_id, title, description, event_type, address, latitude, longitude, start_datetime, end_datetime, organizer_user_id, website_url, image_url, is_approved)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                description = VALUES(description),
                event_type = VALUES(event_type),
                address = VALUES(address),
                latitude = VALUES(latitude),
                longitude = VALUES(longitude),
                start_datetime = VALUES(start_datetime),
                end_datetime = VALUES(end_datetime),
                website_url = VALUES(website_url),
                image_url = VALUES(image_url),
                is_approved = VALUES(is_approved)`,
            [
                event.event_id,
                event.title,
                event.description,
                event.event_type,
                event.address,
                event.latitude,
                event.longitude,
                event.start_datetime,
                event.end_datetime,
                event.organizer_user_id,
                event.website_url,
                event.image_url,
                event.is_approved
            ]
        );
    }

    eventsLoaded = true;
}

function mapEventCard(event, index) {
    return {
        id: event.event_id,
        slug: makeEventSlug(event),
        title: event.title,
        image: getEventImage(index, event.image_url),
        date: formatDateRange(event.start_datetime, event.end_datetime),
        time: formatTimeRange(event.start_datetime, event.end_datetime),
        location: getShortLocation(event.address),
        attendees: Number(event.attendee_count || 0)
    };
}

function mapEventDetail(event, index) {
    const attendees = Number(event.attendee_count || 0);
    const attendeeAvatars = Math.min(attendees, 6);
    const attendeeExtra = attendees > 6 ? attendees - 6 : 0;

    return {
        id: event.event_id,
        slug: makeEventSlug(event),
        title: event.title,
        cover: getEventImage(index, event.image_url),
        date: formatDateRange(event.start_datetime, event.end_datetime),
        time: formatTimeRange(event.start_datetime, event.end_datetime),
        location: getShortLocation(event.address),
        address: event.address,
        attendees: attendees,
        about: event.description,
        attendeeAvatars: attendeeAvatars,
        attendeeExtra: attendeeExtra,
        directionsUrl: getDirectionsUrl(event.address)
    };
}

async function loadEventRows() {
    await ensureEventsInDatabase();

    const [rows] = await pool.query(
        `SELECT
            e.event_id,
            e.title,
            e.description,
            e.event_type,
            e.address,
            e.latitude,
            e.longitude,
            e.start_datetime,
            e.end_datetime,
            e.website_url,
            e.image_url,
            COUNT(er.reminder_id) AS attendee_count
         FROM event e
         LEFT JOIN event_reminder er
            ON er.event_id = e.event_id
            AND er.rsvp_status = 'going'
         WHERE e.is_approved = 1
         GROUP BY
            e.event_id,
            e.title,
            e.description,
            e.event_type,
            e.address,
            e.latitude,
            e.longitude,
            e.start_datetime,
            e.end_datetime,
            e.website_url,
            e.image_url
         ORDER BY e.start_datetime ASC`
    );

    return rows;
}

async function findEventBySlug(slug) {
    const rows = await loadEventRows();
    return rows.find((event) => makeEventSlug(event) === slug) || null;
}

async function getEventsPage(req, res) {
    try {
        const rows = await loadEventRows();

        return res.render("events", {
            activePage: "events",
            message: req.query.message || "",
            events: rows.map((event, index) => mapEventCard(event, index))
        });
    } catch (error) {
        console.error("Events page failed:", error);
        return res.status(500).send("Failed to load events");
    }
}

async function getEventDetailsPage(req, res) {
    const slug = req.params.slug;

    try {
        const rows = await loadEventRows();
        const event = rows.find((item) => makeEventSlug(item) === slug);

        if (!event) {
            return res.redirect("/events");
        }

        const index = rows.findIndex((item) => item.event_id === event.event_id);

        return res.render("event-details", {
            activePage: "events",
            message: req.query.message || "",
            event: mapEventDetail(event, index < 0 ? 0 : index)
        });
    } catch (error) {
        console.error("Event detail page failed:", error);
        return res.status(500).send("Failed to load event details");
    }
}

async function postRsvp(req, res) {
    const slug = req.params.slug;

    if (!req.session.user_id) {
        return res.redirect("/login?error=Please%20log%20in%20to%20RSVP");
    }

    try {
        const event = await findEventBySlug(slug);

        if (!event) {
            return res.redirect("/events");
        }

        await pool.query(
            `INSERT INTO event_reminder (user_id, event_id, reminder_setting, rsvp_status)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                reminder_setting = VALUES(reminder_setting),
                rsvp_status = VALUES(rsvp_status)`,
            [req.session.user_id, event.event_id, "none", "going"]
        );

        return res.redirect(`/events/${slug}?message=RSVP%20saved`);
    } catch (error) {
        console.error("RSVP failed:", error);
        return res.redirect(`/events/${slug}?message=RSVP%20failed`);
    }
}

module.exports = {
    getEventsPage,
    getEventDetailsPage,
    postRsvp
};
