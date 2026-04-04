"use client";

import React from "react";
import { motion } from "framer-motion";

const logos = [
  "FitZone Gym",
  "StyleHouse Salon",
  "AcadeMind Coaching",
  "TastyBites",
  "RealEstate Pro",
  "Sharma Classes",
  "GlowUp Beauty",
  "PowerFit",
  "HomeQuest Realty",
  "Spice Garden",
  "QuickLearn",
  "PrimeProperty",
];

const TrustedBy = () => {
  return (
    <section className="py-20 border-y border-[#27272a] bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
          Trusted by 2,400+ businesses across India
        </p>
      </div>

      {/* Infinite Scroll Container */}
      <div className="flex overflow-hidden group">
        <motion.div
          animate={{
            x: [0, -1035], // Approx width of one set of logos
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex whitespace-nowrap gap-16 items-center pr-16"
        >
          {/* Double the logos for seamless loop */}
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={i}
              className="text-2xl md:text-3xl font-black text-zinc-700 hover:text-[#25D366] transition-colors cursor-default select-none grayscale hover:grayscale-0"
            >
              {logo}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedBy;
