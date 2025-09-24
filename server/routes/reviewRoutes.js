import express from "express";
import { protect } from "../middleware/auth.js";
import {
  addReview,
  deleteReview,
  getCarReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/:id/reviews", protect, addReview);

router.get("/:id/reviews", getCarReviews);

router.delete("/:carId/reviews/:reviewId", protect, deleteReview);

export default router;
