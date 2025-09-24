import Review from "../models/Review.js";
import Car from "../models/Car.js";

// Add a new review
export const addReview = async (req, res) => {
  try {
    const { id: carId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    const alreadyReviewed = await Review.findOne({ car: carId, user: userId });
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ success: false, message: "You already reviewed this car" });
    }

    let review = await Review.create({
      car: carId,
      user: userId,
      rating,
      comment,
    });

    review = await review.populate("user", "name email");
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reviews for a car
export const getCarReviews = async (req, res) => {
  try {
    const { id: carId } = req.params;
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    const reviews = await Review.find({ car: carId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (review.user.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await review.deleteOne();
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
