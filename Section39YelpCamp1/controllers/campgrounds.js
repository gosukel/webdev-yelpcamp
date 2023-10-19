const { Campground } = require("../models/campground");
const { cloudinary, storage } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds })
    }

module.exports.newCampground = async (req, res) => {
        const geoData = await geocoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send();
        // console.log(geoData.body.features[0].geometry);
        // res.send('OK!')
        const camp = new Campground(req.body.campground);
        camp.images = req.files.map(f => ({url: f.path, filename: f.filename}));
        camp.author = req.user._id;
        camp.geometry = geoData.body.features[0].geometry;
        await camp.save();
        req.flash('success', 'Successfully made a new campground!')
        res.redirect(`/campgrounds/${camp._id}`)
    }

module.exports.newForm = (req, res) => {
        res.render("campgrounds/new");
}

module.exports.showCampground = async (req, res) => {
        const camp = await Campground.findById(req.params.id).populate({
            path: 'reviews',
            populate: {
                path: 'author',
            }
        }).populate('author').exec();
        if (!camp) {
            req.flash('error', 'Campground not found');
            return res.redirect('/campgrounds')
        };
        // console.log(camp);
        res.render("campgrounds/show", { camp })
    }

module.exports.editCampground = async (req, res) => {
        const { id } = req.params;
        const images = req.files.map(f => ({url: f.path, filename: f.filename}));
        const camp = await Campground.findOneAndUpdate({_id: id}, {...req.body.campground})
        camp.images.push(...images)
        await camp.save();
        if (req.body.deleteImages) {
            await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
            req.body.deleteImages.forEach(filename => {
                try {
                    cloudinary.uploader.destroy(filename)
                } catch (error) {
                    console.log(error)
                }
            })
        }
        req.flash('success', 'Successfully updated a campground!')
        res.redirect(`/campgrounds/${camp._id}`)
    }

module.exports.deleteCampground = async (req, res) => {
        const camp = await Campground.findByIdAndDelete(req.params.id);
        if (camp.images) {
            camp.images.forEach(img => {
                try {
                    cloudinary.uploader.destroy(img.filename)
                } catch (error) {
                    console.log(error)
                }
            })
        }
        req.flash('success', 'Successfully deleted a campground!')
        res.redirect("/campgrounds")
    }

module.exports.editForm = async (req, res) => {
        const camp = await Campground.findById(req.params.id);
        if (!camp) {
            req.flash('error', 'Campground not found');
            return res.redirect('/campgrounds')
        }
        res.render("campgrounds/edit", { camp })
    }