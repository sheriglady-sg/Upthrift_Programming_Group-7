const { validationResult } = require("express-validator");

function isHtmlRequest(req) {
    const acceptHeader = req.headers.accept || "";
    return acceptHeader.includes("text/html");
}

function buildRedirectUrl(basePath, message) {
    const divider = basePath.includes("?") ? "&" : "?";
    return `${basePath}${divider}error=${encodeURIComponent(message)}`;
}

function handleValidationErrors(redirectPath) {
    return function (req, res, next) {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
            return next();
        }

        const firstError = errors.array()[0];
        const message = firstError.msg || "Invalid form data";

        if (isHtmlRequest(req)) {
            const targetPath = typeof redirectPath === "function"
                ? redirectPath(req)
                : redirectPath;

            return res.redirect(buildRedirectUrl(targetPath, message));
        }

        return res.status(400).json({
            message: message,
            errors: errors.array()
        });
    };
}

module.exports = {
    handleValidationErrors
};
