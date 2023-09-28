const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReview = async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); //--> req.body.review, in the Show form we asign body and rating to review -> review[body] and review[rating]
    review.author = req.user._id; //--> to associate the review with the author
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'New review added.')
    res.redirect(`/campgrounds/${campground._id}`);

}
module.exports.deleteReview = async (req, res)=>{
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});//-> pull: operator from mongo that removes a value from an array
    await Review.findByIdAndDelete(req.params.id);
    req.flash('success', 'Review successfully deleted.')
    res.redirect(`/campgrounds/${id}`);
}