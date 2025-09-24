import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import sendMail from "../mails/bookingMail.js"

// Function to Check Availability of Car for a give Date
// Function to Check Availability of Car for a given Date
export const checkAvailability = async (car, pickupDate, returnDate) => {
  const bookings = await Booking.find({
    car,
    pickupDate: { $lte: returnDate },
    returnDate: { $gte: pickupDate },
  });
  return bookings.length === 0;
};

// API to check availability of Cars for the given Date and location
export const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;

    // fetch all available cars for the given location
    const cars = await Car.find({ location, isAvailable: true });

    // check car availability for the given date range using promise
    const availableCarsPromises = cars.map(async (car) => {
      const isAvailable = await checkAvailability(
        car._id,
        pickupDate,
        returnDate
      );
      return { ...car._doc, isAvailable };
    });

    let availableCars = await Promise.all(availableCarsPromises);
    availableCars = availableCars.filter((car) => car.isAvailable === true);

    res.json({ success: true, availableCars });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// API to List User Bookings
export const getUserBookings = async (req, res) => {
  try {
    const { _id } = req.user;
    const bookings = await Booking.find({ user: _id })
      .populate("car")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// API to get Owner Bookings
export const getOwnerBookings = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.json({ success: false, message: "Unauthorized" });
    }
    const bookings = await Booking.find({ owner: req.user._id })
      .populate("car user")
      .select("-user.password")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// API to change booking status
export const changeBookingStatus = async (req, res) => {
  try {
    const { _id } = req.user;
    const { bookingId, status } = req.body;

    const booking = await Booking.findById(bookingId).populate("car user");

    if(!booking){
      return res.json({success: false, message: "Booking not found"})
    }
    if(booking.owner.toString() !== _id.toString()){
       return res.json({ success: false, message: "Unauthorized" });
    }

    booking.status = status;
    await booking.save()

    if(status.toLowerCase() === "confirmed"){
      await sendMail(
        booking.user.email,
        "Booking Confirmed - Online Vehicle Car Rental",
        `
        <h2>Booking Confirmed</h2>
        <p>Your booking for <b>${booking.car.brand} ${booking.car.model}</b> has been <b> confirmed </b> by the owner.</p>
        <p><b>Pickup:</b> ${new Date(booking.pickupDate).toDateString()}</p>
        <p><b>Return:</b> ${new Date(booking.returnDate).toDateString()}</p>
        <p>Thank you for choosing us 🚗</p>
        `,
         `Hi ${booking.user.name}, your booking for ${booking.car.brand} ${booking.car.model} is now confirmed.`

      )
    }

    res.json({ success: true, message: "Status Updated",booking  });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};
