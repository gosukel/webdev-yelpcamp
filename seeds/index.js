if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const ejs = require("ejs");
const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const { Campground } = require("../models/campground");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
console.log(mapBoxToken);
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const dbUrl = process.env.DB_URL;

// console.log(descriptors.length);
// console.log(places.length);

// const PORT = 3000;
// const app = express();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(dbUrl);
        console.log("MongoDB Connected: " + conn.connection.host);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

connectDB();

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async function () {
    await Campground.deleteMany({});
     
    for(let i = 0; i < 40; i++) {
        const randPrice = Math.floor(Math.random() * 20) + 10;
        const sampleLoc = sample(cities);
        const camp = new Campground({
            author: '652f4bbc23e1ec16ee5450b0',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${sampleLoc.city}, ${sampleLoc.state}`,
            images: [{
                url: "https://source.unsplash.com/collection/20431456",
                filename: "unsplashTestFile"
            }],
            price: randPrice,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, molestiae eius maiores, incidunt, praesentium doloribus recusandae ducimus aliquid libero atque temporibus quod voluptates harum adipisci non. Recusandae magnam voluptate distinction."    
        });
        camp.geometry = {
            type: "Point",
            coordinates: [sampleLoc.longitude, sampleLoc.latitude]
        };
        await camp.save();
    }
}

seedDB().then(() => mongoose.connection.close());
console.log('Connection Closed');