const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const {cloudinary} = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({}); //--> 'graving' campgrounds
    res.render('campgrounds/index', { campgrounds }) //--> second arg, requiring to be able to use in the index.js
}

module.exports.renderNewForm = (req, res) => { //--> needs to be before getById, since it doens't exist yet, se it has no Id, so it would stop the app from runing}
    res.render('campgrounds/new') 
}

module.exports.createCampground = async (req, res, next) =>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // if(!req.body.campground) throw new ExpressError ('Invalid Campground Data', 400);  //--> rudimentary way of validating data
    const campground = new Campground(req.body.campground); //--> notice it's not in quotes, bcause it's not a string but an actual value
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename}))
    campground.author = req.user._id; //--> associate the created camground with the current logged in user. 
    await campground.save();
    console.log(campground);
    req.flash('success', 'successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
    } 

module.exports.showCampground = async (req, res) =>{
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',  //--> in order to populate the campground'reviews witht heir autors, we make an object {} and use path
        populate: {
             path: 'author'
            }
        }).populate('author'); //-> req.params to get the id
        // console.log(campground);
        if (!campground) {
            req.flash('error', 'Cannot find that campground!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show', {campground});
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground} ); //--> (...) we can use the spread operator because campground is an object
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for (let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({$pull: { images: {filename: {$in: req.body.deleteImages}}}})
        console.log(campground)
    }    
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) =>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id) //-> req.params to get the id
    req.flash('success', 'Campground successfully deleted.')
    res.redirect('/campgrounds');
}