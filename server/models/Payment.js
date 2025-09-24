import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  paymentId: { type: String },
  signature: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  amount: { type: Number, required: true }, // in rupees, e.g., 1500
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
}, { timestamps: true });

export default mongoose.model("Payment", PaymentSchema);
