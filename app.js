if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const MongoStore = require('connect-mongo');
const ejs = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const { AppError } = require("./utilities/middleware")
const session = require('express-session');
const flash = require('connect-flash');
const passport = require("passport");
const localStrategy = require("passport-local");
const { User } = require("./models/users");
const mongoSantize = require('express-mongo-sanitize');
const helmet = require('helmet');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const authRoutes = require("./routes/auth");
const dbUrl = process.env.DB_URL;

// MONGO SET UP ( NOT CONNECTING )
const PORT = 3000;
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(dbUrl);
        console.log("MongoDB Connected: " + conn.connection.host);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

// APP SETUP
const app = express();
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"))
app.use(mongoSantize());

const sessionOptions = {
    name: 'campsession',
    secret: 's4Wfds63sffFfsaedaf', 
    resave: false, 
    saveUninitialized: false,   
    store: MongoStore.create({ 
        mongoUrl: dbUrl,
        touchAfter: 24 * 3600
    })
};

// LOCAL SESSION OPTIONS
// const sessionOptions = {
//     name: 'campsession',
//     secret: 's4Wfds63sffFfsaedaf', 
//     resave: false, 
//     saveUninitialized: false,   
//     cookie: {
//         httpOnly: true,
//         // secure: true,            <--------   this will not work with localhost, enable when we switch to a web host platform
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//         maxAge:  1000 * 60 * 60 * 24 * 7,
//     }
// };

app.use(session(sessionOptions));
app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://cdn.jsdelivr.net",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.tiles.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: ["'self'", "https: data:"],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
)

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/auth', authRoutes)


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({email: 'this2@gmail.com', username: 'newUser2'});
    const newUser = await User.register(user, 'password2');
    res.send(newUser);


})


app.all('*', (req, res, next) => {
    next(new AppError(404, "Page Not Found"))
})


app.use((err, req, res, next) => {
    const { status = 500, message = "Something Went Wrong...", stack } = err;
    res.status(status).render("error", { err })
})



connectDB().then(() => {
    app.listen(PORT, () => {console.log(`Listening on PORT: ${PORT}`)});
})