const express = require('express');
const router = express.Router();
const multer = require("multer");
// const { campSchema } = require("../utilities/schemas")
const { Campground } = require("../models/campground");
const campgrounds = require('../controllers/campgrounds')
const { wrapAsync, isLoggedIn, validateCampground, AppError, isAuthor } = require('../utilities/middleware');
const { cloudinary, storage } = require('../cloudinary');
const upload = multer({ storage });


router.route("/")
    .get(wrapAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('campground[image]'), validateCampground, wrapAsync(campgrounds.newCampground))



router.route("/new")
    .get(isLoggedIn, campgrounds.newForm)    


router.route("/:id")
    .get(wrapAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('campground[image]'), validateCampground, wrapAsync(campgrounds.editCampground))
    .delete(isAuthor, wrapAsync(campgrounds.deleteCampground))


router.route("/:id/edit")
    .get(isLoggedIn, isAuthor, wrapAsync(campgrounds.editForm))


module.exports = router;