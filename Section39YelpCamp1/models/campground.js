const mongoose = require("mongoose");
const { Review }= require("./review")
const Schema = mongoose.Schema;

// https://res.cloudinary.com/dmzlkgsjj/image/upload/v1696475149/YelpCamp/sv8e7oyw8n5clkqwpzlo.jpg

const ImageSchema = new Schema({
    url: String,
    filename: String,        
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})


const opts = { toJSON: { virtuals: true } }
const campgroundSchema = new Schema({
    title: String,
    price: Number,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],

}, opts);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <a href="/campgrounds/${this._id}">${this.title}</a><br>
    <p>${this.location}</p>`
})

campgroundSchema.post('findOneAndDelete', async function(camp) {
    if (camp.reviews.length) {
        await Review.deleteMany({ _id: {$in: camp.reviews}})
    }
})

const Campground = mongoose.model("Campground", campgroundSchema);


exports.Campground = Campground;