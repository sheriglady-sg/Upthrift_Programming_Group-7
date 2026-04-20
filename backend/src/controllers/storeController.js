const pool = require("../config/db");
const storesData = require("../data/storesData");

let storesLoaded = false;

function makeSlug(text) {
    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function makeStoreSlug(store) {
    return `${makeSlug(store.name)}-${store.store_id}`;
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

function getStoreTypeId(typeName) {
    if (typeName === "charity_shop") {
        return 1;
    }

    if (typeName === "vintage_store") {
        return 2;
    }

    if (typeName === "fleamarket") {
        return 3;
    }

    if (typeName === "consignment") {
        return 4;
    }

    return 1;
}

function buildStoreDescription(store) {
    const typeName = formatTypeName(store.store_type || store.type_name);
    const hours = store.opening_hours ? `Hours: ${store.opening_hours}.` : "";
    const priceLevel = store.price_level ? `Price level: ${store.price_level}.` : "";
    return `A ${typeName} in ${store.address}. ${hours} ${priceLevel}`.trim();
}

function getShortLocation(address) {
    const parts = String(address || "").split(",");

    if (parts.length >= 2) {
        return `${parts[0].trim()}, ${parts[1].trim()}`;
    }

    return String(address || "See address");
}

function combineRating(baseRating, baseCount, localRatingTotal, localCount) {
    const totalCount = baseCount + localCount;

    if (totalCount === 0) {
        return 0;
    }

    return (baseRating * baseCount + localRatingTotal) / totalCount;
}

function findSeedStoreById(storeId) {
    return storesData.find((store) => store.store_id === Number(storeId)) || null;
}

function makeSeedStoreRow(store) {
    return {
        store_id: store.store_id,
        name: store.name,
        address: store.address,
        google_maps_url: store.google_maps_url,
        phone_number: store.phone_number,
        website_url: store.website_url,
        price_level: store.price_level,
        type_name: store.store_type,
        local_rating_total: 0,
        local_review_count: 0
    };
}

async function ensureStoresInDatabase() {
    if (storesLoaded) {
        return;
    }

    for (const store of storesData) {
        await pool.query(
            `INSERT INTO thrift_store
                (store_id, name, address, latitude, longitude, google_maps_url, phone_number, website_url, price_level, user_submitted, submitted_by_user_id, verification_status, store_type_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                address = VALUES(address),
                latitude = VALUES(latitude),
                longitude = VALUES(longitude),
                google_maps_url = VALUES(google_maps_url),
                phone_number = VALUES(phone_number),
                website_url = VALUES(website_url),
                price_level = VALUES(price_level),
                verification_status = VALUES(verification_status),
                store_type_id = VALUES(store_type_id)`,
            [
                store.store_id,
                store.name,
                store.address,
                store.latitude,
                store.longitude,
                store.google_maps_url,
                store.phone_number,
                store.website_url,
                store.price_level,
                0,
                null,
                "verified",
                getStoreTypeId(store.store_type)
            ]
        );
    }

    storesLoaded = true;
}

function mapStoreCard(store) {
    const baseStore = findSeedStoreById(store.store_id) || store;
    const baseCount = Number(baseStore.review_amount || 0);
    const baseRating = Number(baseStore.rating_avg || 0);
    const localCount = Number(store.local_review_count || 0);
    const localRatingTotal = Number(store.local_rating_total || 0);
    const finalCount = baseCount + localCount;
    const finalRating = combineRating(baseRating, baseCount, localRatingTotal, localCount);

    return {
        id: store.store_id,
        slug: makeStoreSlug(baseStore),
        name: baseStore.name,
        image: getStoreImage(store.store_id),
        rating: finalRating.toFixed(1),
        reviewCount: finalCount,
        distance: getShortLocation(baseStore.address),
        description: buildStoreDescription(baseStore)
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

    try {
        await ensureStoresInDatabase();

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
                COALESCE(SUM(r.rating), 0) AS local_rating_total,
                COUNT(r.review_id) AS local_review_count
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
    } catch (error) {
        console.error("Store table load failed, using local store data:", error.message);

        const simpleQuery = String(searchText || "").trim().toLowerCase();

        return storesData
            .filter((store) => {
                if (!simpleQuery) {
                    return true;
                }

                return store.name.toLowerCase().includes(simpleQuery)
                    || store.address.toLowerCase().includes(simpleQuery);
            })
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(makeSeedStoreRow);
    }
}

async function loadStoreReviews(storeId) {
    try {
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
            [storeId]
        );

        return reviewRows;
    } catch (error) {
        console.error("Store reviews load failed:", error.message);
        return [];
    }
}

async function findStoreBySlug(slug) {
    const rows = await loadStoreRows("");
    const store = rows.find((item) => makeStoreSlug(item) === slug);

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

        const reviewRows = await loadStoreReviews(storeRow.store_id);

        const baseStore = findSeedStoreById(storeRow.store_id);
        const baseCount = Number(baseStore ? baseStore.review_amount : 0);
        const baseRating = Number(baseStore ? baseStore.rating_avg : 0);
        const localCount = reviewRows.length;
        const localRatingTotal = reviewRows.reduce((sum, review) => sum + Number(review.rating || 0), 0);
        const finalCount = baseCount + localCount;
        const finalRating = combineRating(baseRating, baseCount, localRatingTotal, localCount);

        return res.render("store", {
            activePage: "discover",
            message: req.query.message || "",
            store: {
                id: storeRow.store_id,
                slug: makeStoreSlug(storeRow),
                name: storeRow.name,
                rating: finalRating.toFixed(1),
                reviewCount: finalCount,
                address: storeRow.address,
                hours: baseStore && baseStore.opening_hours ? baseStore.opening_hours : "Please check the store website for opening hours.",
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

        const baseStore = findSeedStoreById(storeRow.store_id);
        const baseCount = Number(baseStore ? baseStore.review_amount : 0);
        const baseRating = Number(baseStore ? baseStore.rating_avg : 0);
        const localCount = Number(storeRow.local_review_count || 0);
        const localRatingTotal = Number(storeRow.local_rating_total || 0);
        const finalCount = baseCount + localCount;
        const finalRating = combineRating(baseRating, baseCount, localRatingTotal, localCount);

        return res.render("write-review", {
            activePage: "discover",
            error: req.query.error || "",
            store: {
                slug: makeStoreSlug(storeRow),
                name: storeRow.name,
                rating: finalRating.toFixed(1),
                reviewCount: finalCount
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
