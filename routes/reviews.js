const express = require('express');
const router = express.Router({ mergeParams: true }); // Ensures that parameters defined in a parent router are accessible in a child router.

const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');

const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');


// Add new review
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;

    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a new review');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;