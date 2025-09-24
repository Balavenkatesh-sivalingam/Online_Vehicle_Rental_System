import React from "react";
import Title from "./Title";
import { assets } from "../assets/assets";
import { easeOut, motion } from "motion/react";

const Testimonial = () => {
  const testimonials = [
    {
      name: "Emma Rodriguez",
      location: "Barcelona, Spain",
      image: assets.testimonial_image_1,
      review:
        "Exceptional Vehicle rental service and attention to detail. Everything was handled professionally and efficiently from start to finish. Highly recommended!",
    },
    {
      name: "Liam Johnson",
      address: "New York, USA",
      image: assets.testimonial_image_2,
      review:
        "I’m truly impressed by the quality and consistency. The entire rental process was smooth, and the service exceeded all expectations. Thank you!",
    },
    {
      id: 3,
      name: "Sophia Lee",
      address: "Seoul, South Korea",
      image: assets.testimonial_image_1,
      review:
        "Fantastic experience! From start to finish, the team was professional, responsive, and genuinely cared about delivering great results on renting Vehicles.",
    },
  ];
  return (
    <motion.div className="py-28 px-6 md:px-16 lg:px-24 xl:px-44">
      <Title
        title="Driven by Customer Satisfaction"
        subTitle="Discover why smart travelers choose Vehicle Rental 
            for premium rides across the city and beyond."
      />

      <div className="grid grid-cols-1-1 sm:grid-cols-2-2 lg:grid-cols-3 gap-8 mt-18">
        {testimonials.map((testimonial, index) => (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2, ease: easeOut }}
            viewport={{ once: true, amount: 0.3 }}
            key={index}
            className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-500"
          >
            <div className="flex items-center gap-3">
              <img
                className="w-12 h-12 rounded-full"
                src={testimonial.image}
                alt={testimonial.name}
              />
              <div>
                <p className="text-xl">{testimonial.name}</p>
                <p className="text-gray-500">{testimonial.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <img key={index} src={assets.star_icon} alt="star-icon" />
                ))}
            </div>
            <p className="text-gray-500 max-w-90 mt-4 font-light">
              "{testimonial.review}"
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Testimonial;
