const pool = require("../config/db");

function makeSlug(text) {
    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function formatTypeName(typeName) {
    return String(typeName || "thrift store").replace(/_/g, " ");
}

function formatTimeAgo(value) {
    if (!value) {
        return "";
    }

    const reviewDate = new Date(value);
    const now = Date.now();
    const diffInMinutes = Math.floor((now - reviewDate.getTime()) / 60000);

    if (diffInMinutes < 1) {
        return "Just now";
    }

    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
}

function getStoreImage(storeId) {
    const images = [
        "/images/store1.jpg",
        "/images/store2.jpg",
        "/images/store3.jpg"
    ];

    if (!storeId) {
        return "";
    }

    return images[(storeId - 1) % images.length];
}

function buildStoreDescription(store) {
    const typeName = formatTypeName(store.type_name);
    const priceLevel = store.price_level ? `Price level: ${store.price_level}.` : "";
    return `A ${typeName} in ${store.address}. ${priceLevel}`.trim();
}

function mapStoreCard(store) {
    return {
        id: store.store_id,
        slug: makeSlug(store.name),
        name: store.name,
        image: getStoreImage(store.store_id),
        rating: Number(store.rating || 0).toFixed(1),
        reviewCount: store.review_count || 0,
        distance: "See address",
        description: buildStoreDescription(store)
    };
}

function mapReview(review) {
    const username = review.username || "User";

    return {
        author: username,
        initials: username.slice(0, 1).toUpperCase(),
        rating: review.rating || 0,
        text: review.comment,
        timeAgo: formatTimeAgo(review.created_at)
    };
}

async function loadStoreRows(searchText) {
    const query = searchText ? `%${searchText}%` : "%";

    const [rows] = await pool.query(
        `SELECT
            s.store_id,
            s.name,
            s.address,
            s.google_maps_url,
            s.phone_number,
            s.website_url,
            s.price_level,
            st.type_name,
            COALESCE(AVG(r.rating), 0) AS rating,
            COUNT(r.review_id) AS review_count
         FROM thrift_store s
         LEFT JOIN store_type st ON st.store_type_id = s.store_type_id
         LEFT JOIN store_review r ON r.store_id = s.store_id
         WHERE s.verification_status != 'rejected'
         AND (s.name LIKE ? OR s.address LIKE ?)
         GROUP BY
            s.store_id,
            s.name,
            s.address,
            s.google_maps_url,
            s.phone_number,
            s.website_url,
            s.price_level,
            st.type_name
         ORDER BY s.name ASC`,
        [query, query]
    );

    return rows;
}

async function findStoreBySlug(slug) {
    const rows = await loadStoreRows("");

    const store = rows.find((item) => makeSlug(item.name) === slug);

    if (!store) {
        return null;
    }

    return store;
}

async function getDiscoverPage(req, res) {
    const query = (req.query.q || "").trim();

    try {
        const rows = await loadStoreRows(query);

        return res.render("discover", {
            activePage: "discover",
            query: query,
            stores: rows.map(mapStoreCard)
        });
    } catch (error) {
        console.error("Discover page failed:", error);
        return res.status(500).send("Failed to load discover page");
    }
}

async function getStorePage(req, res) {
    const slug = req.params.slug;

    try {
        const storeRow = await findStoreBySlug(slug);

        if (!storeRow) {
            return res.status(404).send("Store not found");
        }

        const [reviewRows] = await pool.query(
            `SELECT
                r.rating,
                r.comment,
                r.created_at,
                u.username
             FROM store_review r
             INNER JOIN user u ON u.user_id = r.user_id
             WHERE r.store_id = ?
             ORDER BY r.created_at DESC`,
            [storeRow.store_id]
        );

        return res.render("store", {
            activePage: "discover",
            message: req.query.message || "",
            store: {
                id: storeRow.store_id,
                slug: makeSlug(storeRow.name),
                name: storeRow.name,
                rating: Number(storeRow.rating || 0).toFixed(1),
                reviewCount: storeRow.review_count || 0,
                address: storeRow.address,
                hours: "Please check the store website for opening hours.",
                contact: storeRow.phone_number || "Not provided",
                website: storeRow.website_url || "",
                mapsUrl: storeRow.google_maps_url || "",
                photos: getStoreImage(storeRow.store_id),
                reviews: reviewRows.map(mapReview)
            }
        });
    } catch (error) {
        console.error("Store page failed:", error);
        return res.status(500).send("Failed to load store page");
    }
}

async function getWriteReviewPage(req, res) {
    const slug = req.params.slug;

    if (!req.session.user_id) {
        return res.redirect("/login?error=Please%20log%20in%20to%20write%20a%20review");
    }

    try {
        const storeRow = await findStoreBySlug(slug);

        if (!storeRow) {
            return res.status(404).send("Store not found");
        }

        return res.render("write-review", {
            activePage: "discover",
            error: req.query.error || "",
            store: {
                slug: makeSlug(storeRow.name),
                name: storeRow.name,
                rating: Number(storeRow.rating || 0).toFixed(1),
                reviewCount: storeRow.review_count || 0
            }
        });
    } catch (error) {
        console.error("Write review page failed:", error);
        return res.status(500).send("Failed to load review page");
    }
}

async function postReview(req, res) {
    const slug = req.params.slug;
    const rating = Number(req.body.rating || 0);
    const review = (req.body.review || "").trim();

    if (!req.session.user_id) {
        return res.redirect("/login?error=Please%20log%20in%20to%20write%20a%20review");
    }

    if (!rating || rating < 1 || rating > 5 || !review) {
        return res.redirect(`/store/${slug}/review?error=Please%20add%20a%20rating%20and%20review`);
    }

    try {
        const storeRow = await findStoreBySlug(slug);

        if (!storeRow) {
            return res.status(404).send("Store not found");
        }

        await pool.query(
            "INSERT INTO store_review (store_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
            [storeRow.store_id, req.session.user_id, rating, review]
        );

        return res.redirect(`/store/${slug}?message=Review%20posted%20successfully`);
    } catch (error) {
        console.error("Post review failed:", error);
        return res.redirect(`/store/${slug}/review?error=Failed%20to%20post%20review`);
    }
}

module.exports = {
    getDiscoverPage,
    getStorePage,
    getWriteReviewPage,
    postReview
};
