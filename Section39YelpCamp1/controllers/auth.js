const { User } = require("../models/users");

module.exports.registerForm = (req, res) => {
    res.render('auth/register');
}

module.exports.addUser = async (req, res) => {
    const { newUsername, newPassword, newEmail } = req.body.user
    var newUser = null;
    try {
        const user = new User({email: newEmail, username: newUsername});
        let newUser = await User.register(user, newPassword);
        req.login(newUser, err => {
            if (err) return next(err);
            req.flash(`success`, `Welcome to Yelp Camp ${newUsername}!`)
            res.redirect('/campgrounds')
        })
    } catch (error) {
        req.flash('error', error.message);
        return res.redirect('/auth/register')
    }
}

module.exports.loginForm = (req, res) => {
    res.render('auth/login')
}

module.exports.login = async (req, res) => {
    req.flash(`success`, `Welcome back to Yelp Camp!`);
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    })
}