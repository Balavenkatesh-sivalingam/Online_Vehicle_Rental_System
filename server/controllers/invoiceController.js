import PDFDocument from "pdfkit";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

export const generateInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("car")
      .populate("user", "name email");

      if(!booking){
        return res.status(404).json({success: false, message: "Booking not found"})
      }
    // Ensures the requesting user owns this booking
    if(booking.user._id.toString() !== req.user._id.toString()){
        return res.status(403).json({success: false, message: "Not authorized"})
    }

    const payment = await Payment.findOne({
        car: booking.car._id,
        user: booking.user._id,
        orderId: {$exists: true},
        status: "paid"
    })
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice_${booking._id}.pdf`)

      doc.pipe(res);

    // 🔹 Header
    doc.fontSize(22).text("Car Rental Invoice", { align: "center" });
    doc.moveDown();

    // 🔹 Customer info
    doc.fontSize(12).text(`Customer: ${booking.user.name}`);
    doc.text(`Email: ${booking.user.email}`);
    doc.moveDown();

    // 🔹 Booking info
    doc.text(`Car: ${booking.car.brand} ${booking.car.model}`);
    doc.text(`Rental Period: ${booking.pickupDate.toDateString()} - ${booking.returnDate.toDateString()}`);
    doc.text(`Location: ${booking.car.location}`);
    doc.text(`Status: ${booking.status}`);
    doc.moveDown();

    if(payment){
         doc.text(`Payment ID: ${payment.paymentId}`);
      doc.text(`Order ID: ${payment.orderId}`);
      doc.text(`Payment Status: ${payment.status}`);
      doc.moveDown();
    }
    doc.fontSize(14).text(`Total Price: ₹${booking.price}`, { align: "right" });
    doc.end();
  

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error generating invoice" });
  }
};
