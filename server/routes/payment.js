import express from "express";
import { createRazorpayOrder, verifyRazorpayPayment } from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js"; // using protect

const paymentRouter = express.Router();

paymentRouter.post("/create-order", protect, createRazorpayOrder);
paymentRouter.post("/verify", protect, verifyRazorpayPayment);

export default paymentRouter;
