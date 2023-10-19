const express = require('express');
const router = express.Router({ mergeParams: true });
// const { campSchema, reviewSchema } = require("../utilities/schemas")
// const { Campground } = require("../models/campground");
// const { Review } = require("../models/review");
const { wrapAsync, isLoggedIn, validateCampground, validateReview, AppError, isReviewer } = require('../utilities/middleware');
const reviews = require('../controllers/reviews')

router.route("/")
    .post(isLoggedIn, validateReview, wrapAsync(reviews.addReview))    


router.route("/:reviewId")
    .delete(isLoggedIn, isReviewer, wrapAsync(reviews.deleteReview))



module.exports = router;