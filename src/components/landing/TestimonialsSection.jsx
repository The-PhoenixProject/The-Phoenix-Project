"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
const sarahImg = "/assets/landingImgs/sarahImg.png";
const mikeImg = "/assets/landingImgs/mikeImg.png";
const emmaImg = "/assets/landingImgs/emmaImg.png";
// import "./TestimonialsSection.css"; // ← Import CSS file

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    text: "Phoenix Project has completely changed how I think about waste. The community is incredibly supportive and inspiring!",
    img: sarahImg,
    rating: 5,
  },
  {
    id: 2,
    name: "John Miller",
    text: "An amazing experience from start to finish. Highly recommend to anyone looking to grow with like-minded people!",
    img: mikeImg,
    rating: 5,
  },
  {
    id: 3,
    name: "Emma Davis",
    text: "I love how easy it is to connect and learn from others. Definitely worth joining this community.",
    img: emmaImg,
    rating: 5,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.4, // delay between each card
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function TestimonialsSection() {
  return (
    <section id="reviews" className="testimonials-section px-2">
      <div className="container px-5">
        <h2 className="section-title text-center mb-4 p-4 ">What Our Community Says</h2>

        <motion.div
          className="row justify-content-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.id}
              className="col-md-6 col-lg-4 mb-4 d-flex justify-content-center"
              variants={cardVariants}
            >
              <div className="testimonial-card">
                <div className="testimonial-header">
                  <img src={t.img} alt={t.name} className="testimonial-avatar" />
                  <div>
                    <h6 className="testimonial-name">{t.name}</h6>
                    <div className="testimonial-stars">
                      {[...Array(t.rating)].map((_, i) => (
                        <FaStar key={i} color="#FFD700" size={16} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="testimonial-text">"{t.text}"</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
