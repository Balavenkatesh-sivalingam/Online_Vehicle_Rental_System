import express from "express";
import { changeBookingStatus, checkAvailabilityOfCar, getOwnerBookings, getUserBookings } from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";
import { generateInvoice } from "../controllers/invoiceController.js";

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityOfCar)
bookingRouter.get('/user', protect, getUserBookings ) 
bookingRouter.get('/owner', protect, getOwnerBookings ) 
bookingRouter.post('/change-status', protect, changeBookingStatus ) 
bookingRouter.get("/:id/invoice", protect, generateInvoice)

export default bookingRouter;