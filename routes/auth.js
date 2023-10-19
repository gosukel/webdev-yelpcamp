const express = require('express');
const passport = require('passport');
const router = express.Router();
const { User } = require("../models/users");
const { AppError, wrapAsync, storeReturnTo } = require("../utilities/middleware");
// const wrapAsync = require("../utilities/wrapAsync");
const auth = require('../controllers/auth')


router.route('/register')
    .get(auth.registerForm)
    .post(wrapAsync(auth.addUser))


router.route('/login')
    .get(auth.loginForm)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/auth/login'}), wrapAsync(auth.login))


router.route('/logout')
    .get(auth.logout)

module.exports = router;    