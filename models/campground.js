const mongoose = require('mongoose');
const Review = require('./review');
const { campgroundSchema } = require('../schemas');
const Schema = mongoose.Schema; 

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200')
} )


const opts = { toJSON: { virtuals: true}};

const CampgroundSchema = new Schema ({
    title: String, 
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
        } },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
   
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () { //--> we are registering a virtual property that can be used in other parts of the doc
    return `
    <strong><a href = 'campgrounds/${this._id}'>${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>` 
});

CampgroundSchema.post('findOneAndDelete', async function (doc){ //-> we pass int he doc we just deleted ie. a campground. POST what happends after deleted
    if(doc){
        await Review.deleteMany({
            _id:{
                $in: doc.reviews //--> the reviews contined in that doc
            }
        })
    }
} )

module.exports = mongoose.model('Campground', CampgroundSchema)  //--> setting the CampgroundSchema as the basic model to export
