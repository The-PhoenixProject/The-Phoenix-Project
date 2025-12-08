import React from "react";
import { motion } from "framer-motion";

export default function FeatureCard({ title, text, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="FeatureCard"
      
    >
      <div style={{ marginBottom: 10 , fontSize: 1 }}>{icon}</div>
      <h3 style={{ color: "black", marginBottom: 10  , fontSize: 20 , padding: '0.5rem'}}>{title}</h3>
      <p style={{ color: "#333", fontSize: 14 }}>{text}</p>
    </motion.div>
  );
}
