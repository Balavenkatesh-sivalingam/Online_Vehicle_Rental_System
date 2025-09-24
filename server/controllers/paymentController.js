import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import Payment from "../models/Payment.js";
import sendMail from "../mails/bookingMail.js";
import { checkAvailability } from "./bookingController.js";

const razorpay = new Razorpay({
  key_id: process.env.RZ_KEY_ID,
  key_secret: process.env.RZ_KEY_SECRET,
});

// Create Razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const { car, pickupDate, returnDate } = req.body;

    const carData = await Car.findById(car);
    

    if (!carData) return res.json({ success: false, message: "Car not found" });

    if (carData.owner.toString() === userId.toString()) {
      return res.json({
        success: false,
        message: "You cannot book your own car",
      });
    }

    const available = await checkAvailability(car, pickupDate, returnDate);
    if (!available)
      return res.json({ success: false, message: "Car not available" });

    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);
    if (returned < picked) {
      return res.json({
        success: false,
        message: "Return date cannot be before pickup date",
      });
    }

    const noOfDays = Math.max(
      1,
      Math.ceil((returned - picked) / (1000 * 60 * 60 * 24))
    );
    const price = carData.pricePerDay * noOfDays;
    const amountInPaise = Math.floor(price * 100); // ensure integer
    const shortReceipt = `rcpt_${Date.now()}`;

    // 🔹 Debug logs
    console.log("💰 Creating Razorpay order with amount:", amountInPaise, "paise");
    console.log("🚗 Car ID:", carData._id, "👤 User ID:", userId);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: shortReceipt,
      payment_capture: 1,
    });

    console.log("✅ Razorpay order created:", order.id);

    const payment = await Payment.create({
      orderId: order.id,
      user: userId,
      car,
      pickupDate,
      returnDate,
      amount: price,
      currency: "INR",
      status: "created",
    });

    res.json({ success: true, order, payment });
  } catch (error) {
    console.error("❌ Error in createRazorpayOrder:", error);
    res
      .status(500)
      .json({ success: false, message: error.message, stack: error.stack });
  }
};

// Verify payment
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
    }).populate("car user");
    if (!payment)
      return res
        .status(400)
        .json({ success: false, message: "Payment not found" });

    const generated_signature = crypto
      .createHmac("sha256", process.env.RZ_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      payment.status = "failed";
      await payment.save();
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // Prevent duplicate booking
    let booking = await Booking.findOne({
      car: payment.car._id,
      user: payment.user._id,
      pickupDate: payment.pickupDate,
      returnDate: payment.returnDate,
      price: payment.amount,
    });

    if (!booking) {
      booking = await Booking.create({
        car: payment.car._id,
        owner: payment.car.owner,
        user: payment.user._id,
        pickupDate: payment.pickupDate,
        returnDate: payment.returnDate,
        price: payment.amount,
        status: "pending",
      });
    }

    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = "paid";
    await payment.save();

    await sendMail(
      payment.user.email,
      "Booking Received - Online Vehicle Car Rental",
      `
      <h2>Payment received & booking created</h2>
      <p>Hi ${payment.user.name},</p>
      <p>Your payment for <b>${payment.car.brand} ${
        payment.car.model
      }</b> was successful.</p>
      <p><b>Pickup:</b> ${new Date(payment.pickupDate).toDateString()}</p>
      <p><b>Return:</b> ${new Date(payment.returnDate).toDateString()}</p>
      `,
      `Hi ${payment.user.name}, your booking for ${payment.car.brand} ${payment.car.model} is received and pending owner confirmation.`
    );

    res.json({
      success: true,
      message: "Payment verified and booking created",
      booking,
      payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
