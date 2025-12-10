import React from "react";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import FeatureCard from "./FeaturesCard";
import { FaCamera, FaShoppingBag, FaMedal } from "react-icons/fa";
import { GrVmMaintenance } from "react-icons/gr";
import { IoMdChatboxes } from "react-icons/io";

const cards = [
  {
    id: 1,
    title: "Eco Story Feed",
    text: "Share before & after recycling stories",
    icon: <FaCamera size={35} color="#38765A" />,
  },
  {
    id: 2,
    title: "Marketplace",
    text: "Buy, sell, or trade upcycled goods.",
    icon: <FaShoppingBag size={35} color="#A7C957" />,
  },
  {
    id: 3,
    title: "Community Chat",
    text: "Connect with fellow eco-enthusiasts.",
    icon: <IoMdChatboxes size={35} color="#38765A" />,
  },
  {
    id: 4,
    title: "Eco Badges",
    text: "Earn rewards for eco-impact",
    icon: <FaMedal size={35} color="#A7C957" />,
  },
  {
    id: 5,
    title: "Maintainance Services",
    text: " Get help to recycle your items",
    icon: <GrVmMaintenance size={35} color="#38765A" />,
  },
  {
    id: 6,
    title: "Eco Story Feed",
    text: "Share before & after recycling stories",
    icon: <FaCamera size={35} color="#A7C957" />,
  },
  {
    id: 7,
    title: "Marketplace",
    text: "Buy, sell, or trade upcycled goods.",
    icon: <FaShoppingBag size={35} color="#38765A" />,
  },
  {
    id: 8,
    title: "Community Chat",
    text: "Connect with fellow eco-enthusiasts.",
    icon: <IoMdChatboxes size={35} color="#A7C957" />,
  },
  {
    id: 9,
    title: "Eco Badges",
    text: "Earn rewards for eco-impact",
    icon: <FaMedal size={35} color="#38765A" />,
  },
  {
    id: 10,
    title: "Maintainance Services",
    text: " Get help to recycle your items",
    icon: <GrVmMaintenance size={35} color="#A7C957" />,
  },
  {
    id: 11,
    title: "Eco Story Feed",
    text: "Share before & after recycling stories",
    icon: <FaCamera size={35} color="#38765A" />,
  },
  {
    id: 12,
    title: "Marketplace",
    text: "Buy, sell, or trade upcycled goods.",
    icon: <FaShoppingBag size={35} color="#A7C957" />,
  },
  {
    id: 13,
    title: "Community Chat",
    text: "Connect with fellow eco-enthusiasts.",
    icon: <IoMdChatboxes size={35} color="#38765A" />,
  },
  {
    id: 14,
    title: "Eco Badges",
    text: "Earn rewards for eco-impact",
    icon: <FaMedal size={35} color="#A7C957" />,
  },
  {
    id: 15,
    title: "Maintainance Services",
    text: " Get help to recycle your items",
    icon: <GrVmMaintenance size={35} color="#38765A" />,
  },
  {
    id: 16,
    title: "Eco Story Feed",
    text: "Share before & after recycling stories",
    icon: <FaCamera size={35} color="#A7C957" />,
  },
  {
    id: 17,
    title: "Marketplace",
    text: "Buy, sell, or trade upcycled goods.",
    icon: <FaShoppingBag size={35} color="#38765A" />,
  },
  {
    id: 18,
    title: "Community Chat",
    text: "Connect with fellow eco-enthusiasts.",
    icon: <IoMdChatboxes size={35} color="#A7C957" />,
  },
  {
    id: 19,
    title: "Eco Badges",
    text: "Earn rewards for eco-impact",
    icon: <FaMedal size={35} color="#38765A" />,
  },
  {
    id: 20,
    title: "Maintainance Services",
    text: " Get help to recycle your items",
    icon: <GrVmMaintenance size={35} color="#A7C957" />,
  },
  {
    id: 21,
    title: "Eco Story Feed",
    text: "Share before & after recycling stories",
    icon: <FaCamera size={35} color="#38765A" />,
  },
  {
    id: 22,
    title: "Marketplace",
    text: "Buy, sell, or trade upcycled goods.",
    icon: <FaShoppingBag size={35} color="#A7C957" />,
  },
  {
    id: 23,
    title: "Community Chat",
    text: "Connect with fellow eco-enthusiasts.",
    icon: <IoMdChatboxes size={35} color="#38765A" />,
  },
  {
    id: 24,
    title: "Eco Badges",
    text: "Earn rewards for eco-impact",
    icon: <FaMedal size={35} color="#A7C957" />,
  },
  {
    id: 25,
    title: "Maintainance Services",
    text: " Get help to recycle your items",
    icon: <GrVmMaintenance size={35} color="#38765A" />,
  },
];

export default function FeaturesSection() {
  const baseX = useMotionValue(0);
  const speed = 0.05; // السرعة (غيّريها حسب رغبتك)

  useAnimationFrame((t, delta) => {
    let move = baseX.get() - delta * speed;
    // لو خرج عن حدود الطول يرجع يكمّل من الأول
    if (move <= -cards.length * 260) move = 6;
    baseX.set(move);
  });
  let TheCards= [...cards, ...cards ]
  return (
    <div id="features">
    <div className="d-flex  justify-content-center mt-5 p-2">
       <h2 className="title-color">Platform Features</h2>
    </div>
    <div className="d-flex  justify-content-center mb-4">
    <div className="featuresSection">
      <motion.div
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.4}
        style={{
          display: "flex",
          gap: "40px",
          x: baseX, // هنا الحركة مربوطة فعلاً بالـ MotionValue
          willChange: "transform",
        }}
      >
        
        {/* التكرار لإنشاء شريط مستمر */}
        {TheCards.map((card, index) => (
          <FeatureCard
            key={index}
            title={card.title}
            text={card.text}
            icon={card.icon}
          />
        ))}
      </motion.div>
    </div>
    </div>
    </div>
  );
}
