const { body } = require("express-validator");

const signupValidation = [
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 2, max: 30 }).withMessage("Username must be 2 to 30 characters"),
    body("email")
        .trim()
        .isEmail().withMessage("Please enter a valid email")
        .normalizeEmail(),
    body("password")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("confirmPassword")
        .custom((value, { req }) => {
            if (!value) {
                return true;
            }

            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }

            return true;
        })
];

const loginValidation = [
    body("email")
        .trim()
        .isEmail().withMessage("Please enter a valid email")
        .normalizeEmail(),
    body("password")
        .notEmpty().withMessage("Password is required")
];

const forgotPasswordValidation = [
    body("email")
        .trim()
        .isEmail().withMessage("Please enter a valid email")
        .normalizeEmail()
];

const resetPasswordValidation = [
    body("token")
        .trim()
        .notEmpty().withMessage("Reset token is required"),
    body("password")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("confirmPassword")
        .notEmpty().withMessage("Please confirm your password")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }

            return true;
        })
];

const createPostValidation = [
    body("category")
        .trim()
        .notEmpty().withMessage("Category is required"),
    body("caption")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 500 }).withMessage("Caption must be 500 characters or less"),
    body("location_tag")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 120 }).withMessage("Location must be 120 characters or less")
];

const writeReviewValidation = [
    body("rating")
        .notEmpty().withMessage("Rating is required")
        .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("review")
        .trim()
        .notEmpty().withMessage("Review is required")
        .isLength({ max: 500 }).withMessage("Review must be 500 characters or less")
];

module.exports = {
    signupValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    createPostValidation,
    writeReviewValidation
};
