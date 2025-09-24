import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Loader from "../components/Loader";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "motion/react";

const CarDetails = () => {
  const { id } = useParams();
  const {
    cars,
    axios,
    pickupDate,
    setPickupDate,
    user,
    returnDate,
    setReturnDate,
  } = useAppContext();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const currency = import.meta.env.VITE_CURRENCY;
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [rating, setRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/payments/create-order", {
        car: id,
        pickupDate,
        returnDate,
      });
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RZ_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: `${car.brand} ${car.model}`,
        description: "Car Rental Payment",
        order_id: data.order.id,
        prefill: {
          email: user?.email,
          name: user?.name,
        },
        handler: async function (response) {
          try {
            setVerifying(true);
            const verifyRes = await axios.post("/api/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success("Payment Successful & Booking Created!");
              navigate("/my-bookings");
            } else {
              toast.error(
                verifyRes.data.message || "Payment verification failed"
              );
            }
          } catch (error) {
            const msg =
              error.response?.data?.message ||
              error.message ||
              "Something went wrong";
            toast.error(msg);
          } finally {
            setVerifying(false);
          }
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim() || rating === 0)
      return toast.error("Please add review and rating");

    try {
      const { data } = await axios.post(`/api/cars/${id}/reviews`, {
        rating,
        comment: newReview,
      });
      setReviews((prev) => [data.review, ...prev]);
      setNewReview("");
      setRating(0);
      toast.success("Review added");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to add review";
      toast.error(msg);
    }
  };

  const handleDeleteReview = async (reviewId, carId) => {
    try {
      await axios.delete(`/api/cars/${carId}/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      toast.success("Review deleted");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete review";
      toast.error(msg);
    }
  };

  useEffect(() => {
    setCar(cars.find((car) => car._id === id));

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const { data } = await axios.get(`/api/cars/${id}/reviews`);
        setReviews(data.reviews);
      } catch (error) {
        toast.error("Failed to load reviews");
      } finally {
        setLoadingReviews(false);
      }
    };
    if (id) fetchReviews();
  }, [cars, id]);

  return (
    <>
      {verifying && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
          <Loader />
          <p className="text-white mt-4 text-lg">Finalizing payment...</p>
        </div>
      )}
      {car ? (
        <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-gray-500 cursor-pointer"
          >
            <img
              src={assets.arrow_icon}
              alt="arrowicon"
              className="rotate-180 opacity-65"
            />
            Back to all Vehicle
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* left side */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <motion.img
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                src={car.image}
                alt="carImage"
                className="w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-3xl font-bold">
                    {car.brand}
                    {car.model}
                  </h1>
                  <p className="text-gray-500 text-lg">
                    {car.category} • {car.year}{" "}
                  </p>
                </div>
                <hr className="border-borderColor my-6" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {
                      icon: assets.users_icon,
                      text: `${car.seating_capacity} Seats`,
                    },
                    { icon: assets.fuel_icon, text: car.fuel_type },
                    { icon: assets.car_icon, text: car.transmission },
                    { icon: assets.location_icon, text: car.location },
                  ].map(({ icon, text }) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      key={text}
                      className="flex flex-col items-center bg-light p-4 rounded-lg"
                    >
                      <img src={icon} alt="ic" className="h-5 mb-2" />
                      {text}
                    </motion.div>
                  ))}
                </div>
                {/* description */}
                <div>
                  <h1 className="text-xl font-medium mb-3">Description</h1>
                  <p className="text-gray-500">{car.description}</p>
                </div>
                {/* features */}
                <div>
                  <h1 className="text-xl font-medium mb-3">Features</h1>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      "360 Camera",
                      "Bluetooth",
                      "GPS",
                      "Heated Seats",
                      "Rear View Mirror",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center text-gray-500"
                      >
                        <img
                          src={assets.check_icon}
                          className="h-4 mr-2"
                          alt="checkicon"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-6">
                  {/* reviews */}
                  <div>
                    <h1 className="text-xl font-medium mb-3">Reviews</h1>

                    {loadingReviews ? (
                      <p>Loading reviews...</p>
                    ) : reviews.length > 0 ? (
                      <ul className="space-y-4">
                        {reviews.map((r) => (
                          <li
                            key={r._id}
                            className="border border-borderColor p-3 rounded-lg bg-light"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex gap-1 mb-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className={`text-lg ${
                                        star <= r.rating
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <p className="text-gray-700">{r.comment}</p>
                                <small className="text-gray-400">
                                  by {r.user?.name || "Anonymous"}
                                </small>
                              </div>

                              {user &&
                                (user._id === r.user?._id ||
                                  user.role === "admin") && (
                                  <button
                                    onClick={() =>
                                      handleDeleteReview(r._id, car._id)
                                    }
                                    className="text-red-500 text-sm hover:underline ml-4"
                                  >
                                    Delete
                                  </button>
                                )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No reviews yet</p>
                    )}

                    {user && (
                      <form
                        onSubmit={handleAddReview}
                        className="mt-4 flex flex-col gap-2"
                      >
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setRating(star)}
                              className={`text-2xl ${
                                star <= rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            type="text"
                            placeholder="Write a review..."
                            className="flex-1 border border-borderColor px-3 py-2 rounded-lg"
                          />
                          <button
                            type="submit"
                            className="bg-primary text-white px-4 rounded-lg"
                          >
                            Post
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* right side form */}
            <motion.form
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              
              onSubmit={handleSubmit}
              className="shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500"
            >
              <p className="flex items-center justify-between text-2xl text-gray-800 font-semibold">
                {currency}
                {car.pricePerDay}{" "}
                <span className="text-base text-gray-400 font-normal">
                  per day
                </span>
              </p>

              <hr className="border-borderColor my-6" />
              <div className="flex flex-col gap-2">
                <label htmlFor="pickup-date">Pickup Date</label>
                <input
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  type="date"
                  className="border border-borderColor px-3 py-2 rounded-lg "
                  required
                  id="pickup-date"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="return-date">Return Date</label>
                <input
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  type="date"
                  className="border border-borderColor px-3 py-2 rounded-lg "
                  required
                  id="return-date"
                />
              </div>

              <button
                className="w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer"
                disabled={loading || verifying}
              >
                {loading ? "Booking..." : "Book Now"}
              </button>
              <p className="text-center text-sm">
                No credit card required to reserve
              </p>
            </motion.form>
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default CarDetails;
