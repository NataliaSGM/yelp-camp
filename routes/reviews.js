const express = require('express');
const router = express.Router({ mergeParams: true }); //--> router tends to not deconstruc params, so its necessary to do it here
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
// const path = require('path');
// const mongoose = require('mongoose');
// const ejsMate = require('ejs-mate');
// const {reviewSchema} = require('../schemas.js');
// const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
// const Review = require('../models/review');
const reviews = require('../controllers/reviews');
// const ExpressError = require('../utils/ExpressError');
// const methodOverride = require('method-override');

// const { createReview, deleteReview } = require('../controllers/reviews');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;