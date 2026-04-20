const { validationResult } = require("express-validator");

function handleValidationErrors(redirectPath) {
    return function (req, res, next) {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
            return next();
        }

        const firstError = errors.array()[0];
        const message = firstError.msg || "Invalid form data";
        const accept = req.headers.accept || "";

        if (accept.includes("text/html")) {
            let targetPath = redirectPath;

            if (typeof redirectPath === "function") {
                targetPath = redirectPath(req);
            }

            const divider = targetPath.includes("?") ? "&" : "?";
            return res.redirect(`${targetPath}${divider}error=${encodeURIComponent(message)}`);
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
