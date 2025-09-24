import React from "react";
import { assets } from "../assets/assets";
import { motion } from "motion/react";

const Banner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col md:flex-row md:items-start items-center
    justify-between px-8 mins-md:pl-14 pt-10 bg-gradient-to-r from-[#0558FE] TO-[#A9CFFF]
    max-w-6xl md:mx-auto rounded-2xl overflow-hidden"
    >
      <div className="text-white">
        <h2 className="text-3xl font-medium">
          Join Our Fleet of Premium Vehicle Owners.
        </h2>
        <p className="mt-2">
          Elevate your vehicle’s value by sharing it on Vehicle Rental.
        </p>
        <p className="max-w-130">
          We cover the insurance, verify every driver, and secure your payments
          — so you can relax and earn.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-white hover:bg-slate-100 transition-all
            text-primary rounded-lg text-sm mt-4 cursor-pointer"
        >
          List your Vehicle
        </motion.button>
      </div>
      <motion.img
      initial={{opacity:0, x: 50}}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay:0.4 }}
        src={assets.banner_car_image}
        alt="carBanner"
        className="max-h-44 mt-10"
      />
    </motion.div>
  );
};

export default Banner;
